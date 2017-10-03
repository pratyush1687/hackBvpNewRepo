// Initialize Firebase
var config = {
    apiKey: "AIzaSyD3HbvBZcGh1i8HOI3tQMQptTsTtqUFZXQ",
    authDomain: "contactform-d1a4f.firebaseapp.com",
    databaseURL: "https://contactform-d1a4f.firebaseio.com",
    projectId: "contactform-d1a4f",
    storageBucket: "contactform-d1a4f.appspot.com",
    messagingSenderId: "545169872168"
};
firebase.initializeApp(config);

//reference messages collection
var messagesRef = firebase.database().ref('messages');

// listen for form submit
document.getElementById('contactForm').addEventListener('submit', submitForm);

//submit form
function submitForm(e){
    e.preventDefault();//search it

    //GET values
    var name = getInputVal('name');
    var company = getInputVal('company');
    var email = getInputVal('email');
    var phone = getInputVal('phone');
    var message = getInputVal('message');

    //save message
    saveMessage(name, company, email, phone, message);

    //show alert
    document.querySelector('.alert').style.display = 'block';

    //hide alert after 3s
    setTimeout(function(){
        document.querySelector('.alert').style.display = 'none';
    }, 3000);

    document.getElementById('contactForm').reset();
}

//function to get form values
function getInputVal(id){
    return document.getElementById(id).value;
}

//save messages to firebase
function saveMessage(name, company, email, phone, message){
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
        name: name,
        company: company,
        email: email,
        phone: phone,
        message: message
    });
}
