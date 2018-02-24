# SistemaInteligenteDeVigilancia
Sistema de vigilancia en red, con detección de identidad, proyecto piloto para barrios de Ciudad Autonoma de Buenos Aires, Argentina.

Debido a la cantidad de robos y asesinatos, me surge la necesidad de encontrar una manera de que las personas laburantes del país estén seguras, y que mejor forma de hacerlo que recurriendo a la tecnología actual. Por esto es que estoy pensando armar un sistema gratuito para que las personas instalen en sus negocios, para evitar estos robos y persuadir a los delincuentes de entrar en las tiendas.

La idea del proyecto es crear una red de sistemas interconectados con reconocimiento facial, para detectar posibles delincuentes previamente añadidos a la base de datos.

## Requisitos del sistema:
- Conexion a internet(solo para actualizar la base de datos local y avisar a la policia, en el caso de no contar con el mismo, el sistema sigue siendo capaz de verificar la peligrosidad o no de una persona y avisar al proprietario).
- Raspberry pi zero, camara, wifi y una fuente de poder(un cargador de celular funciona perfecto). costo aprox de AR$2000
- Una pc con un procesador mas o menos potente para realizar el procesamiento de las imagenes(Posible utilizacion de nvidia cuda para el procesamiento) AR$10000-20000. Aunque es posible que se pueda distribuir el procesamiento entre la red y omitir tener una pc potente para ello -> lo que si, es necesaria la pc para sincronizar la base de datos y subir la imagen(al subir la imagen, se suscribe al objeto en espera de una confirmacion por parte de los demás equipos de la red).

## El sistema consiste de:

- Una raspberry pi zero, equipada con una camara, se encarga de conseguir la mejor toma de un rostro de una persona, mediante opencv y algunos filtros.
- La raspberry pi, manda a un servidor intermedio la imagen preprocesada(red local).
- El sistema intermedio se encarga de buscar y ver si coincide con alguna persona reportada. En el caso que no, la imagen de igual manera es almacenada junto con otras para determinar los razgos de la persona y poder detectarla con mayor facilidad más adelante, o realizar busquedas en la misma con alguna imagen de un delincuente, para ver si coincide.
- En el caso que el sistema detecte una persona potencialmente peligrosa, o reportada, se envia una alerta al centro de monitoreo, y se lanza una alarma silenciosa en el local, la cual alerta de una posible amenaza a los trabajadores.
- El centro de monitoreo se encarga de revisar la camara, y vigilar a la persona, si está en alguna situación de robo. Si confirma un robo en progreso, se avisa automaticamente la ubicación del mismo y se alerta a la policia.
- Si se captura el delincuente, se fotografia, y con esas mismas fotos, es reportado como persona peligrosa en el sistema, y si se ve de nuevo se seguirá el mismo procedimiento(No será posible omitir la alarma silenciosa que avisa al negocio de que es una persona problematica/peligrosa).


- Si entra una persona con la cara cubierta, el sistema tambien alerta al centro de monitoreo.
