// Función para obtener los cursos
$('#listarCursosBtn').click(function() {
    fetch('http://localhost:3000/api/cursos')
        .then(response => response.json())
        .then(data => {
            $('#listaCursos').empty();
            if (data.length === 0) {
                $('#listaCursos').append('<li class="empty">No hay cursos disponibles.</li>');
            } else {
                data.forEach(curso => {
                    $('#listaCursos').append(`<li class="list-group-item">ID: ${curso.id}, Nombre: ${curso.name}</li>`);
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los cursos:', error);
            $('#listaCursos').empty();
            $('#listaCursos').append('<li class="empty">Hubo un error al obtener los cursos.</li>');
        });
});


  
  // Función para obtener los estudiantes de un curso
  $('#listarEstudiantesBtn').click(function() {
    const courseId = $('#courseId').val();
    $.get(`http://localhost:3000/api/estudiantes/${courseId}`, function(data) {
      $('#listaEstudiantes').empty();
      if (data.length === 0) {
        $('#listaEstudiantes').append('<li class="empty">No hay estudiantes en este curso.</li>');
      } else {
        data.forEach(student => {
          $('#listaEstudiantes').append(`<li>${student.name} - ${student.email}</li>`);
        });
      }
    });
  });
  
  // Función para obtener las tareas de un curso
  $('#listarTareasBtn').click(function() {
    const courseId = $('#courseIdTarea').val();
    $.get(`http://localhost:3000/api/tareas/${courseId}`, function(data) {
      $('#listaTareas').empty();
      if (data.length === 0) {
        $('#listaTareas').append('<li class="empty">No hay tareas asignadas.</li>');
      } else {
        data.forEach(tarea => {
          $('#listaTareas').append(`<li>ID: ${tarea.id}, Título: ${tarea.title}</li>`);
        });
      }
    });
  });
  