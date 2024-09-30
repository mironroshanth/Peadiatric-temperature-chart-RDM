const firebaseConfig = {
    // Your Firebase configuration here
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const usernameElement = document.getElementById('username');
    const passwordElement = document.getElementById('password');

    if (loggedInUser) {
        usernameElement.textContent = `Username: ${loggedInUser}`;
        loadUserData(loggedInUser); // Load user data to get password
    } else {
        usernameElement.textContent = 'No user logged in';
        passwordElement.textContent = '';
    }
});

function signIn(username, password) {
    auth.signInWithEmailAndPassword(username, password)
        .then(() => {
            sessionStorage.setItem('loggedInUser', username);
            loadUserData(username);
        })
        .catch(error => {
            console.error('Sign-in error:', error);
        });
}

function loadUserData(username) {
    const userRef = database.ref('users/' + username);
    userRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Handle password securely
            loadFileList(username); // Pass username to load files
        }
    });
}

function loadFileList(username) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    const patientRef = database.ref('patients/' + username);
    patientRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.files && Array.isArray(data.files)) {
                data.files.forEach(file => {
                    const listItem = document.createElement('li');
                    listItem.textContent = file;
                    listItem.dataset.key = file;
                    listItem.onclick = function() {
                        const selectedFile = document.querySelector('#fileList .selected');
                        if (selectedFile) {
                            selectedFile.classList.remove('selected');
                        }
                        this.classList.add('selected');
                    };
                    fileList.appendChild(listItem);
                });
            } else {
                fileList.innerHTML = '<li>No saved files.</li>';
            }
        } else {
            fileList.innerHTML = '<li>No patient data found.</li>';
        }
    });
}
