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
        // Retrieve password securely or not display it
        loadFileList(); // Load files associated with this user
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
            document.getElementById('password').textContent = `Password: ${data.password}`; // Securely handle passwords
            loadFileList();
        }
    });
}

function loadFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    const username = sessionStorage.getItem('loggedInUser');
    const patientRef = database.ref('patients/' + username);
    patientRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.files) {
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
        }
    });
}
