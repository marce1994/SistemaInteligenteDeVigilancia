# SistemaInteligenteDeVigilancia

La idea del proyecto es crear una red de sistemas interconectados con reconocimiento facial, para detectar posibles delincuentes previamente añadidos a la base de datos(primeramente se utilizara una api centralizada para la deteccion, luego tal vez se haga una red de nodos descentralizado).

## Requisitos del sistema:

- Conexion a internet.
- Raspberry pi 3 model b+, camara raspberry, wifi y un carcador de celular $3500 aprox/max.

## El sistema consiste de:

- Una raspberry pi, equipada con una camara, se encarga de conseguir la mejor toma de un rostro de una persona, mediante opencv y algunos filtros.
- La imagen de la persona se envia a la API, y esta se encarga de compararla con la base de datos.
- Si la persona se encuentra en la base de datos, se envia una alerta al centro de monitoreo.
- Si entra una persona con la cara cubierta, el sistema tambien alerta al centro de monitoreo.
