
todoForm.onsubmit = function (event) {
  event.preventDefault() // Evita o redirecionamento da página
  if (todoForm.name.value != '') {
    var file = todoForm.file.files[0]
    if (file != null) { // verifica se a imagem foi selecionada
      //seleciona apenas um arquivo 
      if (file.type.includes('image')) { // verfifica se o arquivo e do tipo imagem
        var imgName = firebase.database().ref().push().key + '-' + file.name // cria o nome do arquivo
        var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName // cia o caminho do arquivo

        // Cria uma referência de arquivo usando o caminho criado na linha acima
        var storageRef = firebase.storage().ref(imgPath)

        // Inicia o processo de upload
        var upload = storageRef.put(file)

        trackUpload(upload).then(function () {
          storageRef.getDownloadURL().then(function (downLoadURL) { // promise que recebe a URL da imagem
          
            var data = {
              imgUrl: downLoadURL,
              name: todoForm.name.value.toUpperCase()
            }

            dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
              console.log('Tarefa "' + data.name + '" adicionada com sucesso')
            }).catch((error) => {
              showError('Aconteceu Duranta a insersão da tarefa ', error)
            })

            todoForm.name.value = ''
            todoForm.file.value = ''

          })
        })
      } else {
        alert("O arquivo selecionado deve ser uma imagem")
      }

    } else {
      var data = {
        name: todoForm.name.value.toUpperCase()
      }

      dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
        console.log('Tarefa "' + data.name + '" adicionada com sucesso')
      }).catch((error) => {
        showError('Aconteceu Duranta a insersão da tarefa ', error)
      })

      todoForm.name.value = ''

    }

  } else {
    alert("O campo deve ser preenchido corretamente")
  }

  function trackUpload(upload) { // Adicona a imagem
    return new Promise(function (resolver, reject) { // A promise é para retornar a URL da imagem para o objeto
      showItem(progressFeedback)
      upload.on('state_changed',
        function (snapshot) {
          // console.log(snapshot.bytesTransferred / snapshot.totalBytes * 100 + '%')
          progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100 // Mostra a bara de progresso

        }, function (error) {
          hideItem(progressFeedback)
          reject(error)
        },
        function () {
          hideItem(progressFeedback)
          resolver()
        }

      )

      var playPauseUpload = true;

      playPause.onclick = function () { // Pausa e reinicia o upload

        playPauseUpload = !playPauseUpload

        if (playPauseUpload) {
          upload.resume()
          playPause.innerHTML = "Pausar"
        } else {
          upload.pause()
          playPause.innerHTML = "Continuar"

        }

      }

      cancel.onclick = function () {
        upload.cancel()
        alert("Upload Cancelado")
        hideItem(progressFeedback)
      }
    })
  }
}

function fillTodoList(dataSnapshot) {

  ulTodoList.innerHTML = ""
  var num = dataSnapshot.numChildren() //numChildren capta a quantidade de intens
  todoCount.innerHTML = "Você tem " + num + " " + (num > 1 ? "tarefas" : "tarefa");
  dataSnapshot.forEach(item => {

    var value = item.val()
    var li = document.createElement('li') // cria elemento do tipo lista
    var spanLI = document.createElement('span') //cria elemento do tipo span
    var imgLi = document.createElement('img')

    imgLi.src = value.imgUrl ? value.imgUrl : "img/defaultTodo.png"
    imgLi.setAttribute('class','imgTodo')
    li.appendChild(imgLi)

    spanLI.appendChild(document.createTextNode(value.name)) //adiciona o elemento de texto dentro do span
    spanLI.id = item.key
    li.appendChild(spanLI) //adiciona o span dentro do li
    todoCount.appendChild(li) //adicona o li na div

    var liRemoveButton = document.createElement('button') // Cria um botão para a remoção da tarefa
    liRemoveButton.appendChild(document.createTextNode('excluir')) // Define o texto do botão como 'Excluir'
    liRemoveButton.setAttribute('onclick', 'removerTodo("' + item.key + '")') // Configura o onclick do botão de remoção de tarefas
    liRemoveButton.setAttribute('class', 'danger todoBtn') //Define classes de estilização para o nosso botão de remoção
    li.appendChild(liRemoveButton) //Adiciona o botão de remoção no li

    var liUpdateBtn = document.createElement('button') // Cria um botão 
    liUpdateBtn.appendChild(document.createTextNode('Editar')) // Define o texto do botão
    liUpdateBtn.setAttribute('onclick', 'updateTodo("' + item.key + '")') //Implementando o a função no botão
    liUpdateBtn.setAttribute('class', 'alternative todoBtn') //Define classes de estilização para o nosso botão
    li.appendChild(liUpdateBtn) //Adiciona o botão na li

    ulTodoList.appendChild(li)  // Adiciona o li dentro da lista de tarefas

  })

}

function removerTodo(key) {
  var selectedItem = document.getElementById(key);
  var confirmation = confirm('Realmente deseja remover a tarefa "' + selectedItem.innerHTML + '"?')
  if (confirmation) {

    dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().catch((error) => {
      showError('Aconteceu um erro durante a exclusão da tarefa', error)

    })
  }
}

function updateTodo(key) {

  var selectedItem = document.getElementById(key)
  var editar = prompt('insira a atualização "' + selectedItem.innerHTML + '"')
  if (editar != "") {
    var data = {
      name: editar
    }

    dbRefUsers.child(firebase.auth().currentUser.uid).child(key).update(data).then(() => {
      console.log('Tarefa "' + data.name + '" atualizada com sucesso')
    }).catch((error) => {
      showError('Aconteceu Duranta a atualização da tarefa ', error)
    })
  } else {
    alert("Campo Vázio!")
  }

}



