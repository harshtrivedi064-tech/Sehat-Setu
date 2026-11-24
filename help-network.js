(() => {
    const helpNetwork = {
        initialized: false,
        auth: null,
        db: null,
        user: null,
        hospitalProfile: null,
        unsubscribeAuth: null,
        unsubscribePatientRequests: null,
        unsubscribeOpenRequests: null,
        unsubscribeAssignedRequests: null,
        requestSnapshots: {
            open: [],
            assigned: []
        }
    };

    const byId = (id) => document.getElementById(id);
    const serverTimestamp = () => window.firebase.firestore.FieldValue.serverTimestamp();

    function setBadge(text, state) {
        const badge = byId('helpNetworkBadge');
        badge.textContent = text;
        badge.className = `status-badge ${state}`;
    }

    function showError(message) {
        const error = byId('helpNetworkError');
        error.textContent = message;
        error.hidden = false;
    }

    function clearError() {
        const error = byId('helpNetworkError');
        error.textContent = '';
        error.hidden = true;
    }

    function firebaseErrorMessage(error) {
        const messages = {
            'auth/unauthorized-domain': 'This site domain is not authorized in Firebase Authentication.',
            'auth/popup-blocked': 'The Google sign-in window was blocked by your browser.',
            'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
            'auth/configuration-not-found': 'Firebase Authentication is not configured for this project. In Firebase Console, enable Authentication and the Google provider, add localhost under Authorized domains, and confirm this app uses that same project’s web config.',
            'auth/operation-not-allowed': 'Google sign-in is still disabled for this Firebase project. In the project that owns the web app, enable Google under Authentication > Sign-in method and save the change.',
            'permission-denied': 'Firebase denied access. Check that the Firestore security rules are published and hospital approval is set up correctly.',
            unavailable: 'Cloud Firestore is unavailable. Confirm its API is enabled and a Firestore database exists, then publish firestore.rules. If setup is complete, check your connection and retry.'
        };
        return messages[error?.code] || `The request failed (${error?.code || 'unknown error'}). Check Firebase setup and try again.`;
    }

    function clearRequestListeners() {
        helpNetwork.unsubscribePatientRequests?.();
        helpNetwork.unsubscribeOpenRequests?.();
        helpNetwork.unsubscribeAssignedRequests?.();
        helpNetwork.unsubscribePatientRequests = null;
        helpNetwork.unsubscribeOpenRequests = null;
        helpNetwork.unsubscribeAssignedRequests = null;
        helpNetwork.requestSnapshots = { open: [], assigned: [] };
        helpNetwork.requestStreamStates = null;
        byId('patientHelpRequests').replaceChildren();
        byId('hospitalHelpRequests').replaceChildren();
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function formatDate(timestamp) {
        if (!timestamp || typeof timestamp.toDate !== 'function') return 'Just now';
        return timestamp.toDate().toLocaleString();
    }

    function statusLabel(status) {
        return ({
            open: 'Waiting for a hospital',
            dispatched: 'Hospital responding',
            resolved: 'Resolved',
            cancelled: 'Cancelled'
        })[status] || 'Status unavailable';
    }

    function updateHospitalConnectionBadge() {
        const states = helpNetwork.requestStreamStates || {};
        if (states.open === 'error' || states.assigned === 'error') {
            setBadge('Connection error', 'error');
        } else if (states.open === 'loading' || states.assigned === 'loading') {
            setBadge('Syncing live requests...', 'warning');
        } else {
            setBadge('Connected · live requests', 'connected');
        }
    }

    function renderPatientRequests(documents) {
        const container = byId('patientHelpRequests');
        if (!documents.length) {
            container.innerHTML = '<div class="glass-card help-empty-state">You have no help requests yet.</div>';
            return;
        }

        container.innerHTML = documents.map((document) => {
            const request = document.data();
            const phone = escapeHtml(request.phone);
            const statusClass = request.status === 'dispatched' || request.status === 'resolved'
                ? 'connected' : 'warning';
            const hospital = request.assignedHospitalName
                ? `<p><strong>Responding facility:</strong> ${escapeHtml(request.assignedHospitalName)}</p>`
                : '';
            const hospitalPhone = request.assignedHospitalPhone
                ? `<a href="tel:${escapeHtml(request.assignedHospitalPhone)}">Call facility</a>`
                : '';
            const cancelButton = request.status === 'open'
                ? `<button class="btn-secondary" type="button" data-request-action="cancel" data-request-id="${escapeHtml(document.id)}">Cancel request</button>`
                : '';

            return `
                <article class="glass-card help-request-card" data-status="${escapeHtml(request.status)}">
                    <span class="status-badge ${statusClass}">${escapeHtml(statusLabel(request.status))}</span>
                    <h4>${escapeHtml(request.emergencyType)}</h4>
                    <div class="help-request-meta">${escapeHtml(formatDate(request.createdAt))}</div>
                    <p><strong>Location:</strong> ${escapeHtml(request.location)}</p>
                    <p>${escapeHtml(request.details)}</p>
                    ${hospital}
                    <p><a href="tel:${phone}">Call my number</a> ${hospitalPhone}</p>
                    ${cancelButton}
                </article>
            `;
        }).join('');
    }

    function renderHospitalRequests() {
        const container = byId('hospitalHelpRequests');
        const documents = new Map();
        [...helpNetwork.requestSnapshots.open, ...helpNetwork.requestSnapshots.assigned]
            .forEach((document) => documents.set(document.id, document));

        const activeRequests = [...documents.values()]
            .filter((document) => {
                const status = document.data().status;
                return status === 'open' || (status === 'dispatched'
                    && document.data().assignedHospitalUid === helpNetwork.user.uid);
            })
            .sort((left, right) => {
                const leftDate = left.data().createdAt?.toMillis?.() || 0;
                const rightDate = right.data().createdAt?.toMillis?.() || 0;
                return rightDate - leftDate;
            });

        if (!activeRequests.length) {
            container.innerHTML = '<div class="glass-card help-empty-state">There are no active requests right now.</div>';
            return;
        }

        container.innerHTML = activeRequests.map((document) => {
            const request = document.data();
            const assignedToThisHospital = request.status === 'dispatched'
                && request.assignedHospitalUid === helpNetwork.user.uid;
            const action = assignedToThisHospital
                ? `<button class="btn-primary" type="button" data-request-action="resolve" data-request-id="${escapeHtml(document.id)}">Mark resolved</button>`
                : `<button class="btn-primary" type="button" data-request-action="respond" data-request-id="${escapeHtml(document.id)}">Accept &amp; respond</button>`;
            const patientPhone = escapeHtml(request.phone);
            const statusClass = assignedToThisHospital ? 'connected' : 'error';

            return `
                <article class="glass-card help-request-card" data-status="${escapeHtml(request.status)}">
                    <span class="status-badge ${statusClass}">${escapeHtml(statusLabel(request.status))}</span>
                    <h4>${escapeHtml(request.emergencyType)} · ${escapeHtml(request.patientName)}</h4>
                    <div class="help-request-meta">${escapeHtml(formatDate(request.createdAt))}</div>
                    <p><strong>Location:</strong> ${escapeHtml(request.location)}</p>
                    <p>${escapeHtml(request.details)}</p>
                    <p><a href="tel:${patientPhone}">Call ${escapeHtml(request.patientName)}</a></p>
                    ${assignedToThisHospital ? `<p><strong>Your facility is responding.</strong></p>` : ''}
                    ${action}
                </article>
            `;
        }).join('');
    }

    function subscribeToPatientRequests(user) {
        helpNetwork.unsubscribePatientRequests = helpNetwork.db.collection('helpRequests')
            .where('requesterUid', '==', user.uid)
            .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
                const documents = snapshot.docs.sort((left, right) => {
                    const leftDate = left.data().createdAt?.toMillis?.() || 0;
                    const rightDate = right.data().createdAt?.toMillis?.() || 0;
                    return rightDate - leftDate;
                });
                renderPatientRequests(documents);
                if (snapshot.metadata.fromCache) {
                    setBadge('Syncing requests...', 'warning');
                } else {
                    setBadge('Connected', 'connected');
                    clearError();
                }
            }, (error) => {
                setBadge('Connection error', 'error');
                showError(`Could not load your requests. ${firebaseErrorMessage(error)}`);
            });
    }

    function subscribeToHospitalRequests(user) {
        const collection = helpNetwork.db.collection('helpRequests');
        helpNetwork.requestStreamStates = { open: 'loading', assigned: 'loading' };
        updateHospitalConnectionBadge();
        helpNetwork.unsubscribeOpenRequests = collection.where('status', '==', 'open')
            .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
                helpNetwork.requestSnapshots.open = snapshot.docs;
                renderHospitalRequests();
                helpNetwork.requestStreamStates.open = snapshot.metadata.fromCache ? 'loading' : 'connected';
                updateHospitalConnectionBadge();
                if (helpNetwork.requestStreamStates.open === 'connected'
                    && helpNetwork.requestStreamStates.assigned === 'connected') {
                    clearError();
                }
            }, (error) => {
                helpNetwork.requestStreamStates.open = 'error';
                updateHospitalConnectionBadge();
                showError(`Could not load open help requests. ${firebaseErrorMessage(error)}`);
            });

        helpNetwork.unsubscribeAssignedRequests = collection.where('assignedHospitalUid', '==', user.uid)
            .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
                helpNetwork.requestSnapshots.assigned = snapshot.docs;
                renderHospitalRequests();
                helpNetwork.requestStreamStates.assigned = snapshot.metadata.fromCache ? 'loading' : 'connected';
                updateHospitalConnectionBadge();
                if (helpNetwork.requestStreamStates.open === 'connected'
                    && helpNetwork.requestStreamStates.assigned === 'connected') {
                    clearError();
                }
            }, (error) => {
                helpNetwork.requestStreamStates.assigned = 'error';
                updateHospitalConnectionBadge();
                showError(`Could not load requests assigned to your facility. ${firebaseErrorMessage(error)}`);
            });
    }

    async function handleAuthChange(user) {
        clearRequestListeners();
        clearError();
        helpNetwork.user = user;
        helpNetwork.hospitalProfile = null;

        if (!user) {
            byId('helpSignedOut').hidden = false;
            byId('helpSignedIn').hidden = true;
            byId('helpConfigMessage').hidden = true;
            byId('patientHelpView').hidden = true;
            byId('hospitalHelpView').hidden = true;
            byId('helpHospitalApprovalNote').hidden = true;
            byId('helpUserName').textContent = '';
            byId('helpUserEmail').textContent = '';
            byId('helpUserUid').textContent = '';
            setBadge('Signed out', 'warning');
            return;
        }

        byId('helpSignedOut').hidden = true;
        byId('helpSignedIn').hidden = false;
        byId('patientHelpView').hidden = true;
        byId('hospitalHelpView').hidden = true;
        byId('helpHospitalApprovalNote').hidden = true;
        byId('helpUserRole').className = 'status-badge warning';
        byId('helpUserRole').textContent = 'Checking access...';
        byId('helpUserName').textContent = user.displayName || 'Google user';
        byId('helpUserEmail').textContent = user.email || '';
        byId('helpUserUid').textContent = user.uid;
        setBadge('Checking account...', 'warning');

        try {
            const account = await helpNetwork.db.collection('hospitalAccounts').doc(user.uid).get();
            if (helpNetwork.auth.currentUser?.uid !== user.uid) return;

            const profile = account.exists ? account.data() : null;
            const approvedHospital = profile?.approved === true
                && typeof profile.name === 'string'
                && profile.name.trim().length > 0
                && profile.name === profile.name.trim()
                && profile.name.length <= 120
                && typeof profile.contactPhone === 'string'
                && /^[0-9+() -]{7,20}$/.test(profile.contactPhone);

            if (profile?.approved === true && !approvedHospital) {
                byId('helpHospitalApprovalNote').hidden = false;
                byId('patientHelpView').hidden = true;
                byId('hospitalHelpView').hidden = true;
                setBadge('Hospital profile incomplete', 'error');
                showError('Your account is approved as a hospital, but its facility name or contact phone is missing or invalid. Ask the administrator to update the hospital account.');
                return;
            }

            byId('helpHospitalApprovalNote').hidden = approvedHospital;
            byId('patientHelpView').hidden = approvedHospital;
            byId('hospitalHelpView').hidden = !approvedHospital;

            if (approvedHospital) {
                helpNetwork.hospitalProfile = profile;
                byId('helpUserRole').className = 'status-badge connected';
                byId('helpUserRole').textContent = `${profile.name} · approved hospital`;
                subscribeToHospitalRequests(user);
            } else {
                byId('helpUserRole').className = 'status-badge warning';
                byId('helpUserRole').textContent = 'Patient account';
                subscribeToPatientRequests(user);
            }
        } catch (error) {
            setBadge('Connection error', 'error');
            showError(`Could not verify your account role. ${firebaseErrorMessage(error)}`);
        }
    }

    async function submitHelpRequest(event) {
        event.preventDefault();
        clearError();

        if (!helpNetwork.user) {
            showError('Sign in with Google before submitting a request.');
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);
        const submitButton = byId('submitHelpRequest');
        submitButton.disabled = true;

        try {
            await helpNetwork.db.collection('helpRequests').add({
                requesterUid: helpNetwork.user.uid,
                patientName: (helpNetwork.user.displayName || 'Patient').trim().slice(0, 100),
                phone: String(formData.get('phone')).trim(),
                emergencyType: String(formData.get('emergencyType')),
                location: String(formData.get('location')).trim(),
                details: String(formData.get('details')).trim(),
                status: 'open',
                assignedHospitalUid: '',
                assignedHospitalName: '',
                assignedHospitalPhone: '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                dispatchedAt: null,
                resolvedAt: null,
                cancelledAt: null
            });
            form.reset();
            window.showToast?.('success', 'Your request was shared with approved hospitals.');
        } catch (error) {
            showError(`Your request was not sent. ${firebaseErrorMessage(error)}`);
        } finally {
            submitButton.disabled = false;
        }
    }

    async function handleRequestAction(event) {
        const button = event.target.closest('[data-request-action]');
        if (!button) return;

        const requestId = button.dataset.requestId;
        const action = button.dataset.requestAction;
        if (!requestId || !helpNetwork.user) return;

        clearError();
        button.disabled = true;

        try {
            const requestRef = helpNetwork.db.collection('helpRequests').doc(requestId);
            if (action === 'respond') {
                await requestRef.update({
                    status: 'dispatched',
                    assignedHospitalUid: helpNetwork.user.uid,
                    assignedHospitalName: helpNetwork.hospitalProfile.name,
                    assignedHospitalPhone: helpNetwork.hospitalProfile.contactPhone,
                    dispatchedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                window.showToast?.('success', 'Your facility is now responding to this request.');
            } else if (action === 'resolve') {
                await requestRef.update({
                    status: 'resolved',
                    resolvedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                window.showToast?.('success', 'Request marked as resolved.');
            } else if (action === 'cancel') {
                await requestRef.update({
                    status: 'cancelled',
                    cancelledAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                window.showToast?.('info', 'Your request was cancelled.');
            }
        } catch (error) {
            showError(`The request could not be updated. It may already have changed. ${firebaseErrorMessage(error)}`);
        } finally {
            button.disabled = false;
        }
    }

    function initialize() {
        if (helpNetwork.initialized) return;

        const config = window.SEHATSETU_FIREBASE_CONFIG;
        const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
        const isConfigured = config && requiredConfig.every((key) => (
            typeof config[key] === 'string' && config[key].trim().length > 0
        ));

        if (!isConfigured) {
            const message = byId('helpConfigMessage');
            message.textContent = 'Firebase is not configured yet. Add your Firebase web app settings to firebase-config.js, enable Google sign-in, create Firestore, and publish firestore.rules. See README.md for setup steps.';
            message.hidden = false;
            byId('helpSignedOut').hidden = true;
            setBadge('Setup required', 'warning');
            return;
        }

        if (!window.firebase?.initializeApp || !window.firebase.auth || !window.firebase.firestore) {
            byId('helpConfigMessage').textContent = 'The Firebase SDK did not load. Check your internet connection and reload the page.';
            byId('helpConfigMessage').hidden = false;
            setBadge('Firebase unavailable', 'error');
            return;
        }

        try {
            const app = window.firebase.apps.length
                ? window.firebase.app()
                : window.firebase.initializeApp(config);
            helpNetwork.auth = app.auth();
            helpNetwork.db = app.firestore();
            helpNetwork.initialized = true;
            byId('helpConfigMessage').hidden = true;
            byId('helpGoogleSignIn').addEventListener('click', async () => {
                clearError();
                setBadge('Signing in...', 'warning');
                try {
                    await helpNetwork.auth.signInWithPopup(new window.firebase.auth.GoogleAuthProvider());
                } catch (error) {
                    setBadge('Sign-in failed', 'error');
                    showError(`Google sign-in failed. ${firebaseErrorMessage(error)}`);
                }
            });
            byId('helpGoogleSignOut').addEventListener('click', async () => {
                clearError();
                try {
                    await helpNetwork.auth.signOut();
                } catch (error) {
                    showError(`Could not sign out. ${firebaseErrorMessage(error)}`);
                }
            });
            byId('helpRequestForm').addEventListener('submit', submitHelpRequest);
            byId('patientHelpRequests').addEventListener('click', handleRequestAction);
            byId('hospitalHelpRequests').addEventListener('click', handleRequestAction);
            helpNetwork.unsubscribeAuth = helpNetwork.auth.onAuthStateChanged(
                (user) => handleAuthChange(user),
                (error) => {
                    setBadge('Authentication error', 'error');
                    showError(`Could not check Google sign-in. ${firebaseErrorMessage(error)}`);
                }
            );
        } catch (error) {
            setBadge('Firebase setup error', 'error');
            showError(`Firebase could not be initialized. ${firebaseErrorMessage(error)}`);
        }
    }

    window.SehatSetuHelpNetwork = { initialize };
})();
