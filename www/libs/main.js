angular.module('App', [])
    .controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
        var $ = this;
        var urlBase = '.';
        

        const init = function ()
        {
            // Obtener grupos
            $http.get(urlBase+'/grupos').then(
                res => {
                    console.log('Grupos obtenidos!');
                    $.grupos = res.data;


                    // Obtener estudiantes
                    $http.get(urlBase+'/estudiantes').then(
                        res => {
                            var idEstudiantes = [];
                            console.log('Estudiantes obtenidos!');
                            $.estudiantes = res.data;

                            for (let grupo of $.grupos)
                            {
                                grupo.idEstudiantes = [];
                                for (let estudiante of $.estudiantes)
                                {

                                    // Agregar estudiante a grupo
                                    if (grupo.idGrupo == estudiante.idGrupo)
                                    grupo.idEstudiantes.push(estudiante.idEstudiante);
                                }
                                
                            }
                        },
                        err => console.log('Error al obtener estudiantes!', err)
                    );


                    // Obtener estudiantes
                    $http.get(urlBase+'/materias').then(
                        res => {
                            var idMaterias = [];
                            console.log('Materias obtenidos!');
                            $.materias = res.data;

                            for (let grupo of $.grupos)
                            {
                                grupo.idMaterias = [];
                                for (let materia of $.materias)
                                {
                                    if (grupo.idGrupo == materia.idGrupo)
                                    grupo.idMaterias.push(materia.idMateria);
                                }
                                
                            }
                        },
                        err => console.log('Error al obtener materias!', err)
                    );




                },
                err => console.log('Error al obtener grupos!', err)
            );

            $http.get(urlBase+'/salas').then(
                res => {
                    console.log('Salas obtenidos!');
                    $.salas = res.data;
                },
                err => console.log('Error al obtener salas!', err)
            )

            $http.get(urlBase+'/horarios').then(
                res=> {
                    console.log('Horarios obtenidos!');
                    $.horarios = res.data;
                },
                err => console.log('Error al obtener horarios!', err)
            )

            $.getAsignaciones();
        }

        $.iErrorMsg = "";
        $.iSuccessMsg = "";
        $estado = {
            agregandoEstudianteAGrupo: 1,
        }

        $.generos = [
            {id: 'M', label: 'Masculino'},
            {id: 'F', label: 'Femenino'},
        ]


        $.asignacionesDeHorarios = [
            // Formato {id: ID_ASIGNACION, materia: ID_MATERIA, sala: ID_SALA, horario: ID_HORARIO}
            // * Existen dos acciones a realizar sobre las asignaciones: Agregar asignación y eliminar asignación.
            // Agregar una asignación:
            //   * Se inicia una asignación, seleccionando cualquiera de las materias existentes.
            //     * OPCIONAL: Con esto se filtran las salas por capacidad debido a que la materia tiene una viculación a un grupo.
            //   * Se selecciona cualquiera de las salas.
            //   * Se selecciona se selecciona un horario que no esté siendo usado por esa sala.
            // Eliminar una asignación:
            //   * Al eliminar, no hay ningún tipo restricción. Unicamente se usa el id de asignación y se elimina el registro del objeto.
            // Consideraciones
            //   * No se pueden eliminar materias ni salas si estan en una asignación.
            // Para renderizar se usa un for sobre la asignación y se usan funciones getNombreMateria(), getNombreSala(), getNombreHorario().
            // Existen dos funciones getAsignaciones(), updateAsignaciones(); // Que guardan en local storage estas asignaciones.
        ];




        // Formato en runtime de un grupo: {idGrupo: 1, nombre: 'Sin grupo', capacidad: 1000, idMaterias: [], idEstudiantes: []}
        $.grupos = [];
        $.nuevoGrupo = {
            // idGrupo: '',
            nombre: '',
            capacidad: '',
        }
        $.edicionGrupos = [
            false,
            false,
        ]



        $.salas = []
        $.nuevoSala = {
            // idSala: '',
            nombre: '',
            capacidad: '',
        }
        $.edicionSalas = [
            false,
            false,
        ]



        $.estudiantes = []
        $.nuevoEstudiante = {
            idEstudiante: '',
            nombre: '',
            edad: '',
            genero: 'F',
            idGrupo: 1
        }
        $.estudiantesSinGrupo = [];
        $.edicionEstudiantes = [
            false,
            false,
        ]



        $.materias = []
        $.nuevoMateria = {
            idMateria: '',
            nombre: '',
            idGrupo: 1
        }
        $.edicionMaterias = [
            false,
            false,
        ]



        $.horarios = []
        


        $.asignacionHorarios = [];
        $.nuevoAsignacion = {
            // id_asignacion_materia: '',
            idMateria: '',
            idSala: '',
            idHorario: ''
        }

        // METODOS
        
        $.addAsignacionHorario = function (entidad)
        {
            console.log("Adding, ", entidad)
            $http.post(urlBase+'/asignacion-horarios', entidad).then(
                () => {

                    for (let asignacion of $.asignacionHorarios)
                    {
                        if (
                            entidad.idSala == asignacion.idSala &&
                            entidad.idHorario == asignacion.idHorario
                        )
                        {
                            $.notificar(0, "No se puede asignar un horario previamente asignado a la misma sala!");
                            return;
                        }
                    }

                    $.notificar(1, "Asignación agregada!");
                    $.getAsignaciones();
                },
                () => console.log("Asignación no agregada!"),
            )
        }
        $.addEstudianteAGrupo = function (estudiante, idGrupo)
        {   
            estudiante.idGrupo = idGrupo;
            $http.put(urlBase+'/estudiantes', estudiante).then(
                () => {
                    // Eliminar estudiante de grupo anterior
                    for (let grupo of $.grupos)
                    {
                        let indice = grupo.idEstudiantes.indexOf(estudiante.idEstudiante);
                        if (indice != -1)
                        {
                            grupo.idEstudiantes.splice(indice*1, 1);
                            break;
                        }
                    }

                    // Agregar estudiante a nuevo grupo
                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == idGrupo)
                        {
                            grupo.idEstudiantes.push(estudiante.idEstudiante);
                            break;
                        }
                    }
                },
                () => console.log("Estudiante no agregado al grupo!"),
            )
        }
        $.addMateriaAGrupo = function (materia, idGrupo)
        {   
            materia.idGrupo = idGrupo;
            $http.put(urlBase+'/materias', materia).then(
                () => {
                    // Eliminar materia de grupo anterior
                    for (let grupo of $.grupos)
                    {
                        let indice = grupo.idMaterias.indexOf(materia.idMateria);
                        if (indice != -1)
                        {
                            grupo.idMaterias.splice(indice*1, 1);
                            break;
                        }
                    }

                    // Agregar materia a nuevo grupo
                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == idGrupo)
                        {
                            grupo.idMaterias.push(materia.idMateria);
                            break;
                        }
                    }
                },
                () => console.log("Materia no agregada al grupo!"),
            )
        }
        $.addGrupo = function (entidad) {
            var idGrupo = Math.round(Math.random() * (99999 - 10000) + 10000);
            entidad.idGrupo = idGrupo;
            console.log("Agregando grupo...", entidad);
            $http.post(urlBase+'/grupos', entidad).then(
                () => {
                    var copy = {
                        idGrupo: idGrupo,
                        nombre: entidad.nombre,
                        capacidad: entidad.capacidad
                    }
                    $.grupos.push(copy);
                    $.notificar(1, "Grupo agregado!");
                },
                () => console.log("Grupo no agregado!"),
            )
        }
        $.addMateria = function (entidad) {
            var idMateria = Math.round(Math.random() * (99999 - 10000) + 10000);
            entidad.idMateria = idMateria;
            $http.post(urlBase+'/materias', entidad).then(
                () => {
                    $.materias.push(JSON.parse(JSON.stringify(entidad)));

                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == entidad.idGrupo)
                        {
                            grupo.idMaterias.push(entidad.idMateria);
                            break;
                        }
                    }
                    $.notificar(1, "Materia agregada!");
                },
                () => console.log("Materia no agregado!"),
            )
        }
        $.addEstudiante = function (entidad) {

            for (let est of $.estudiantes)
            {
                if (entidad.idEstudiante == est.idEstudiante)
                {
                    $.notificar(0, "No se puede agrear otro estudiante con un ID ya existente!");
                    return;
                }
            }

            console.log("Agregando estudiante...", entidad);
            $http.post(urlBase+'/estudiantes', entidad).then(
                () => {
                    console.log("Estudiante agregado!");
                    $.estudiantes.push(JSON.parse(JSON.stringify(entidad)));

                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == entidad.idGrupo)
                        {
                            grupo.idEstudiantes.push(entidad.idEstudiante);
                            break;
                        }
                    }

                    $.notificar(1, "Estudiante agregado!");
                },
                () => console.log("Estudiante no agregado!"),
            )
        }
        $.addSala = function (entidad) {
            var idSala = Math.round(Math.random() * (99999 - 10000) + 10000);
            entidad.idSala = idSala;
            console.log("Agregando sala...", entidad);
            $http.post(urlBase+'/salas', entidad).then(
                () => {
                    $.notificar(1, "Sala agregada!");

                    $.salas.push(JSON.parse(JSON.stringify(entidad)));
                },
                () => console.log("No agregado!"),
            )
        }




        $.updateGrupo = function (entidad) {
            var copiaGrupo = JSON.parse(JSON.stringify(entidad));
            var data = {
                idGrupo: copiaGrupo.idGrupo,
                nombre: copiaGrupo.nombre,
                capacidad: copiaGrupo.capacidad,
            }
            
            $.notificar(1, "Grupo actualizado!");
            $http.put(urlBase+'/grupos', data).then(
                () => console.log("Grupo actualizado!"),
                () => console.log("Grupo no actualizado!"),
            )
        }
        $.updateMateria = function (entidad) {
            $http.put(urlBase+'/materias', entidad).then(
                () => {
                    $.notificar(1, "Materia actualizada!");
                    $.addMateriaAGrupo(entidad, entidad.idGrupo);
                },
                () => console.log("Materia no actualizada!"),
            )
        }
        $.updateEstudiante = function (entidad) {
            $http.put(urlBase+'/estudiantes', entidad).then(
                () => {
                    $.notificar(1, "Estudiante actualizado!");
                    $.addEstudianteAGrupo(entidad, entidad.idGrupo);
                },
                () => console.log("Estudiante no actualizado!"),
            )
        }
        $.updateSala = function (entidad) {
            $http.put(urlBase+'/salas', entidad).then(
                () => console.log("Sala actualizada!"),
                () => console.log("Sala no actualizada!"),
            )
        }



        $.deleteAsignacionHorario = function (id) {
            $http.delete(urlBase+'/asignacion-horarios/'+id).then(
                () => {
                    var index = $.asignacionHorarios.indexOf(id);
                    for (let i in $.asignacionHorarios)
                    {
                        if ($.asignacionHorarios[i].id_asignacion_materia == id)
                        {
                            $.asignacionHorarios.splice(i*1, 1);
                            break;
                        }
                    }
                    $.notificar(1, "Asignación eliminada!");
                },
                () => console.log("Grupo no eliminado!"),
            )
        }
        $.deleteGrupo = function (id) {
            

            for (let materia of $.materias)
            {
                if (materia.idGrupo == id) {
                    $.notificar(0, "No se puede eliminar grupo! Primero desvincule la materia '"+materia.nombre+"'.");
                    return true;
                }
            }
            for (let estudiante of $.estudiantes)
            {
                if (estudiante.idGrupo == id) {
                    $.notificar(0, "No se puede eliminar grupo! Primero desvincule el estudiante '"+estudiante.nombre+"'.");
                    return true;
                }
            }


            $http.delete(urlBase+'/grupos/'+id).then(
                () => {
                    console.log("Grupo eliminado!");
                    for (let i in $.grupos)
                    {
                        if ($.grupos[i].idGrupo == id)
                        {
                            $.grupos.splice(i*1, 1);
                            break;
                        }
                    }

                    $.notificar(1, "Grupo eliminado! Se desvincularon las materias y estudiantes exitosamente.");
                },
                () => console.log("Grupo no eliminado!"),
            )
        }
        $.deleteMateria = function (id) {
            $http.delete(urlBase+'/materias/'+id).then(
                () => {
                    for (let grupo of $.grupos)
                    {
                        let indiceIdMateria = grupo.idMaterias.indexOf(id);

                        if (indiceIdMateria != -1)
                        {
                            grupo.idMaterias.splice(indiceIdMateria, 1);
                            break;
                        }
                    }
                    for (let i in $.materias)
                    {
                        if ($.materias[i].idMateria == id)
                        {
                            $.materias.splice(i*1, 1);
                            break;
                        }
                    }
                    $.notificar(1, "Materia eliminada!");
                },
                () => console.log("Materia no eliminada!"),
            )
        
        }
        $.deleteEstudiante = function (id) {
            $http.delete(urlBase+'/estudiantes/'+id).then(
                () => {
                    console.log("Estudiante eliminado!");
                    for (let grupo of $.grupos)
                    {
                        let indiceIdEstudiante = grupo.idEstudiantes.indexOf(id);

                        if (indiceIdEstudiante != -1)
                        {
                            grupo.idEstudiantes.splice(indiceIdEstudiante, 1);
                            break;
                        }
                    }
                    for (let i in $.estudiantes)
                    {
                        if ($.estudiantes[i].idEstudiante == id)
                        {
                            $.estudiantes.splice(i*1, 1);
                            break;
                        }
                    }
                    $.notificar(1, "Estudiante eliminado!");
                },
                () => console.log("Estudiante no eliminado!"),
            )
        }
        $.deleteSala = function (id) {
            for (let materia of $.materias)
            {
                if (materia.idSala == id)
                {
                    alert("No se puede elimar la sala, debido a que tiene inscrita una materia.");
                    return true;
                }
            }


            $http.delete(urlBase+'/salas/'+id).then(
                () => {
                    console.log("Sala eliminada!");
                    var index;
                    for (let i in $.salas)
                    {
                        if ($.salas[i].idSala == id)
                        {
                            index = i*1;
                            break;
                        }
                    }

                    $.salas.splice(index, 1);
                },
                () => console.log("Sala no eliminada!"),
            )
        }
        $.deleteEstudianteFromGrupo = function (grupo, entidad) {
            console.log("Removiendo estudiante del grupo...");
            entidad.idGrupo = 1;
            $http.put(urlBase+'/estudiantes', entidad).then(
                () => {
                    console.log("Estudiante removido del grupo!");
                    let indexIdEstudiante = grupo.idEstudiantes.indexOf(entidad.idEstudiante);
                    grupo.idEstudiantes.splice(indexIdEstudiante, 1);

                    // Agregar al grupo por defecto.
                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == 1)
                        {
                            grupo.idEstudiantes.push(entidad.idEstudiante);
                            break;
                        }
                    }
                },
                () => console.log("Estudiante no removido del grupo!"),
            )
        }
        $.deleteMateriaFromGrupo = function (grupo, entidad) {
            console.log("Removiendo materia del grupo...");
            entidad.idGrupo = 1;
            $http.put(urlBase+'/materias', entidad).then(
                () => {
                    console.log("Materia removida del grupo!");
                    let indexIdMateria = grupo.idMaterias.indexOf(entidad.idMateria);
                    grupo.idMaterias.splice(indexIdMateria, 1);

                    // Agregar al grupo por defecto.
                    for (let grupo of $.grupos)
                    {
                        if (grupo.idGrupo == 1)
                        {
                            grupo.idMaterias.push(entidad.idMateria);
                            break;
                        }
                    }
                },
                () => console.log("Materia no removida del grupo!"),
            )
        }



        $.obtenerNombreGrupoPorId = function (id)
        {
            for (let grupo of $.grupos) if (grupo.idGrupo == id) return grupo.nombre;
        }
        $.focus = function (id)
        {
            $._inicio = false;
            $._estudiantes = false;
            $._materias = false;
            $._grupos = false;
            $._salas = false;
            $._horario = false;

            switch (id)
            {
                case 1:
                    $._inicio = true
                    break;
                case 2:
                    $._estudiantes = true
                    break;
                case 3:
                    $._materias = true
                    break;
                case 4:
                    $._grupos = true
                    break;
                case 5:
                    $._salas = true
                    break;
                case 6:
                    $._horario = true
                    break;
            }

            return true;
        }
        $.notificar = function (msgType, msg, delay, reload) {
            
            const run = function (msg)
            {
                
                if (msgType == 0)
                {
                    window.document.getElementById("iErrorMsg").style.display = 'block';
                    $.iErrorMsg = msg;
                    window.setTimeout(function () { window.document.getElementById("iErrorMsg").style.display = 'none'; $.iErrorMsg = "" }, 3000);
                }
                else if (msgType == 1)
                {
                    window.document.getElementById("iSuccessMsg").style.display = 'block';
                    $.iSuccessMsg = msg;
                    window.setTimeout(function () { window.document.getElementById("iSuccessMsg").style.display = 'none'; $.iSuccessMsg = "" }, 3000);
                }

                // Eliminar modales
                
                // Ocultar modal
                window.document.getElementById("exampleModalLong").style.display = "none";
                window.document.getElementById("exampleModalLong1").style.display = "none";
                window.document.getElementById("exampleModalLong2").style.display = "none";
                if(window.document.getElementsByClassName("modal-backdrop")[0]) window.document.getElementsByClassName("modal-backdrop")[0].remove();
            }

            if (delay) window.setTimeout(function () { run(msg); }, delay)
            else run(msg);

            if (reload) window.location.reload();
        };
        $.getAsignaciones = function ()
        {
            $http.get(urlBase+'/asignacion-horarios').then(
                res=> {
                    console.log('Asignaciones de horarios obtenidos!');
                    console.log(res.data)
                    $.asignacionHorarios = res.data;
                },
                err => console.log('Error al obtener asignaciones horarios!', err)
            )
        }




        $.test = function ()
        {
            console.log("TEST");
        }

        init ();
    }

    ])