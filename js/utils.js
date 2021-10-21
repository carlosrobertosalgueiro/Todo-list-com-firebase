
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')
var auth = document.getElementById('auth')
var userContent = document.getElementById('userContent')
var userEmail = document.getElementById('userEmail')
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')
var emailVerified = document.getElementById('emailVerified')
var passwordReset = document.getElementById('passwordReset')
var userName = document.getElementById('userName')
var userImg = document.getElementById('userImg')
var todoForm = document.getElementById('todoForm')
var todoLIst = document.getElementById('todoLIst')
var todoCount = document.getElementById('todoCount')
var ulTodoList = document.getElementById('ulTodoList')
var search = document.getElementById('search')
var progressFeedback = document.getElementById('progressFeedback')
var progress = document.getElementById('progress')
var playPause = document.getElementById('playPause')
var cancel = document.getElementById('cancel')

// Alterar o formulário de autenticação para o cadastro de novas contas
function toggleToRegister() {
  authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
  authFormTitle.innerHTML = 'Insira seus dados para se cadastrar'
  hideItem(register) // Esconder atalho para cadastrar conta
  hideItem(passwordReset) // Esconder a opção de redefinição de senha
  showItem(access) // Mostrar atalho para acessar conta
}

// Alterar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
  authForm.submitAuthForm.innerHTML = 'Acessar'
  authFormTitle.innerHTML = 'Acesse a sua conta para continuar'
  hideItem(access) // Esconder atalho para acessar conta
  showItem(passwordReset) // Mostrar a opção de redefinição de senha
  showItem(register) // Mostrar atalho para cadastrar conta
}

// Simplifica a exibição de elementos da página
function showItem(element) {
  element.style.display = 'block'
}

// Simplifica a remoção de elementos da página
function hideItem(element) {
  element.style.display = 'none'
}

// Mostrar conteúdo para usuários autenticados
function showUserContent(user) {
  console.log(user)
  if (user.providerData[0].providerId != 'password') {
    emailVerified.innerHTML = 'Autenticação por provedor confiável, não é necessário verificar e-mail'
    hideItem(sendEmailVerificationDiv)
  } else {
    if (user.emailVerified) {
      emailVerified.innerHTML = 'E-mail verificado'
      hideItem(sendEmailVerificationDiv)
    } else {
      emailVerified.innerHTML = 'E-mail não verificado'
      showItem(sendEmailVerificationDiv)
    }
  }

  userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
  userName.innerHTML = user.displayName
  userEmail.innerHTML = user.email
  hideItem(auth)

  getDefaultTodoList()


  //PESQUISA
  search.onkeyup = function () {
    if (search.value != "") {
      const searchToUpperCase = search.value.toUpperCase()
      dbRefUsers.child(firebase.auth().currentUser.uid)
        .orderByChild("name") //Ordena os itens pela orden alfabetica
        .startAt(searchToUpperCase).endAt(searchToUpperCase + "'\uf8ff'") //busca as palavras da esquerda pra direita ( '\uf8ff'  é um caractere especial que define a precisão da busca)
        .once('value').then(function (dataSnapshot) { //once - filtra apenas uma vez
          fillTodoList(dataSnapshot)
        })
    } else {
      getDefaultTodoList()
    }
  }
  showItem(userContent)
}

function getDefaultTodoList() {

  dbRefUsers.child(firebase.auth().currentUser.uid).orderByChild("name")
  .on('value', function (dataSnapshot) {
    fillTodoList(dataSnapshot)
  })
}

// Mostrar conteúdo para usuários não autenticados
function showAuth() {
  authForm.email.value = ''
  authForm.password.value = ''
  hideItem(userContent)
  showItem(auth)
}

function showError(prefix, error) {

  switch (error.code) {

    case "auth/invalid-email": alert(" E-mail Invalido!")
      hideItem(loading)
      break;
    case "auth/wrong-password": alert("Senha Invalida!");
      hideItem(loading)
      break;
    case "auth/weak-password": alert("A senha deve ter no minimo 6 caracteres!")
      hideItem(loading)
      break;
    case "auth/email-already-in-use": alert("Já existe uma conta com esse E-mail!");
      hideItem(loading)
      break;
    default: alert(prefix + " " + error)

  }

}

// Atributos extras de configuração de e-mail
var actionCodeSettings = {
  url: 'http://127.0.0.1:5500/'
}

var database = firebase.database()
var dbRefUsers = database.ref('users')
