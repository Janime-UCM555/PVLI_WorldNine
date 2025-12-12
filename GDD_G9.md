# ***Super Mario: Lost Kingdoms***

![Portada](./assets/GDD_Images/Portada.png "PortadaImag")

                        World Nine

                        Ninetendo

         Viaja a través de las fronteras de la mitología

                  Frontiers / Plataformero

Enlaces a la presentación

Canva 0: [[Hito
1]](https://www.canva.com/design/DAGzb2nEieU/D1J-uxTLH2PvjY1JjPl8IA/edit?utm_content=DAGzb2nEieU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

Canva 1: [[Hito
2]](https://www.canva.com/design/DAG3QCwbb8M/S5ueFPO_Ns44HpqeBUyLNw/edit?utm_content=DAG3QCwbb8M&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

Canva 2: [[Hito
3]](https://www.canva.com/design/DAG6WK6OV54/YSxHIjOr2gRc7eHdW4YOiw/edit)

![Logo](./assets/GDD_Images/Ninetendo.png "LogoImg")
>
> **Equipo de desarrollo:**

-   Guillermo Isaac Ramos Medina

-   Ferran Escribá Cufí

-   Rodrigo Ceña Álvarez

-   Jaime Nieto Méndez

> Última Actualización: 11/12/2025

## 1.  **Resumen**

### 1.1 **Descripción**

Super Mario: Lost Kingdoms es un juego en el que Mario avanza sin
necesidad de indicaciones de dirección. Se moverá hacia la derecha y
aparecerán obstáculos y enemigos por su camino que deberán ser
confrontados. Mario podrá obtener un número de Power-Ups que darán una
ventaja al jugador e incluso habilidades para explorar zonas que antes
no se podrían. Después de cada nivel el protagonista se enfrentará a
diversos jefes que lanzarán ataques que deberán ser evitados.
### 1.2  **Género**

Plataformero y runner.

### 1.3  **Público Objetivo**

PEGI 3: capaz de jugar plataformeros, fácil de jugar pero complicado de
dominar.

### 1.4  **Setting**

Super Mario llega al mundo de la Antigua Roma por una tubería. En él
verá como el dios del inframundo Hades secuestra a su hijo Zagreus.
Mario entonces decidirá recorrer los distintos mundos basados en las
mitologías romana, egipcia y griega en ese orden. Mario correrá sin
parar hacia la derecha a través de clásicos niveles al estilo Mario,
basados en las diferentes mitologías hasta llegar al final. Sin embargo,
estos niveles estarán llenos de enemigos que tratarán de frenarle,
incluidos los mismos dioses. Aún así, gracias a diversos Power-Ups por
el nivel y a su capacidad para sobrepasarlos se podrá llegar al final de
cada nivel y completar su misión de rescatar a Zagreus.

### 1.5  **Características principales**

-   Haz que Mario salte cuanto más presiones el botón de salto, enfrenta enemigos, salta sobre plataformas para llegar al final.

-   Recoge monedas para obtener una mayor puntuación al terminar el nivel.

-   Recoge las monedas coleccionables para completar el nivel.

-   Múltiples jefes a los que enfrentarte y obtener poderes nuevos.

-   Estilo pixel art de 32 bits, con arte colorido y personajes diversos y vívidos.

## 2.  **Gameplay**

### 2.1  **Objetivo del juego**

El objetivo del juego es superar todos los niveles y conseguir la mayor
cantidad de puntos posible.

En cada nivel habrá enemigos que derrotar que darán puntos que se
sumarán al total. También se pueden esquivar, pero entonces no sumarán
puntos.

El juego termina al completar todos los niveles, derrotar a los bosses y
haber rescatado a Zagreus. La puntuación obtenida se usará para
actualizar la puntuación máxima.

### 2.2  **Core loops**

Mientras el jugador está en un nivel, el core loop es el siguiente:

1.  Evitar o derrotar a los enemigos por el camino

2.  Recoger monedas y monedas secretas.

3.  Llegar al punto más alto de la bandera

Dentro del core loop principal de juego se pueden incluir las acciones
de matar enemigos, recoger monedas y objetos para mejorar la puntuación,
con el objetivo de superar la puntuación máxima.

![CoreLoop](./assets/GDD_Images/CoreLoop.png "CoreLoops")

## 3.  **Mecánicas**
### 3.1  **Salto Básico**

El jugador se encarga de controlar el salto de Mario, tendrá que estar
en contacto con una superficie para realizar un salto. Si Mario salta
estando encima de un Goomba o un Koopa, dicho enemigo será eliminado. Si
Mario choca desde abajo con un bloque al saltar, tendrá diferentes
interacciones dependiendo del tipo de bloque: si es un bloque "?",
soltará lo que tenga en su interior (Power-Up, monedas, etc); si es un
bloque destructible, en caso de que Mario esté en tamaño grande, el
bloque se destruirá.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Altura de salto       | Altura que salta Mario en proporción al tiempo presionado   | m       |
| Tiempo presionado     | Tiempo que tiene que presionar el jugador al botón de salto | s       |
| Altura máxima de salto| Altura máxima que puede saltar Mario                        | m       |

### 3.2  **Movimiento Horizontal**

El personaje controlado por el jugador se moverá automáticamente en la
dirección hacia la derecha. En caso de encontrarse con un obstáculo
pequeño (como un desnivel no muy alto, un goomba o un koopa.) lo saltará
automáticamente con una pequeña acrobacia. En caso de que el obstáculo
sea de mayor tamaño Mario se detendrá esperando que el jugador salte. En
caso de que el obstáculo tenga pinchos Mario caerá en la burbuja.

| Parámetro            | Descripción                                                             | Unidad |
|-----------------------|-------------------------------------------------------------|-----------|        
| Velocidad             | Velocidad máxima con la m/s que se mueve el personaje en cada dirección.| m/s      |

### 3.3  **Burbujas**

Cuando el jugador muere, ya sea por ser derrotado por enemigos o por
caer al vacío, entrará en una burbuja que arrastrará al jugador hacia el
inicio del nivel.

Durante el trayecto, el jugador puede pulsar un botón para salir de la
burbuja, y continuar el nivel en su posición actual. Siempre que el
jugador caiga dentro de la burbuja su tamaño será el más pequeño (Ver
[Tamaños de Mario]).

Hay 2 burbujas por cada nivel.

Cuando el jugador se queda sin burbujas y muere, se reinicia totalmente
el nivel.

| Parámetro            | Descripción                                                             | Unidad |
|-----------------------|-------------------------------------------------------------|-----------|        
| Velocidad             | Velocidad a la que se mueve la burbuja hacia la izquierda.| m/s      |

### 3.4  **Tamaños de Mario**

Mario tiene diferentes estados que cambian al recibir el impacto de un
obstáculo o enemigo o recogiendo un power-Up.

-   **Mario**: Su tamaño es de 1m x 1m (ancho x alto). Cualquier impacto contra un 
    objeto que haga daño llevará a Mario a la burbuja. En
    caso de coger un champiñón Mario pasará a ser Super Mario. En caso
    de coger un power-Up que no sea ni la estrella ni el champiñón
    Mario pasará a ser Mario Powered-UP.

-   **Super Mario**: Su tamaño es de 1m x 2m (ancho x alto). En caso de
    un impacto contra un objeto que haga daño Super Mario pasará a ser
    Mario. En caso de coger un power-Up que no sea ni la estrella ni
    el champiñón Mario pasará a ser Mario Powered-Up.

-   **Mario Powered-Up**: Su tamaño es de 1m x 2m (ancho x alto). En
    caso de un impacto contra un objeto que haga daño Mario Powered-Up
    pasará a ser Super Mario.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Tamaño de Mario       | Altura de Mario  | m       |
| Estado de Mario     | Capacidad que tiene Mario para recibir daño sin tener que acabar en la burbuja.| unidad       |

### 3.5  **Objetos Recolectables**

Cuando Mario pasa por encima de un objeto, la recoge. Esto implica que
el objeto desaparece y suma un determinado número de puntos a la
puntuación del jugador. Al reiniciar el nivel todos los objetos vuelven
a su sitio. Todos los objetos son de 1m x 1m.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Tamaño      | Tamaño del objeto recolectable  | m       |
| Puntuación    | Puntos que dan los objetos recolectables.| Números naturales      |

#### 3.5.1  **Monedas**

En cada nivel hay un cierto número de monedas que el jugador puede
recoger para aumentar su puntuación. Existen 2 Tipos:

-   Las monedas doradas: Están repartidas por el nivel y dan +100 en la
    puntuación.

-   Las monedas moradas: Hay 5 por nivel una vez conseguidas se marcará
    como obtenida al completar el nivel. Además dan 1000 de puntuación
    cada vez que se consiga una (incluidas las ya obtenidas ).

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Tipo de Moneda      | Tipo de monedas   | Booleano (es o no morada)       |
| Han sido recogidas (Solo para las monedas moradas)     | Valor que indica si la moneda ha sido recogida previamente. | Booleano       |
| Puntuación| Puntos que dan las monedas                        | Números naturales       |

#### 3.5.2  **Power-Ups**

Los power-ups aparecerán cuando Mario salte debajo de un bloque "?". Al
salir los objetos se desplazarán hacia la derecha. Mario recibirá un
aspecto especial en base a su power-up.

Al ser recogidos el jugador recibe +1000 puntos. Si ya había recogido un
Power-Up previamente y no lo había usado, el Power-Up que había recogido
previamente se descarta al recoger otro Power-Up.

A continuación se muestran los objetos y sus bonificaciones al jugador.
(Ver [Tamaños de Mario]).

| Nombre            | Descripción                                                 |
|-----------------------|-------------------------------------------------------------|
| Champiñón de Tamaño       | Cuando Mario está en el estado pequeño podrá consumir el champiñón para hacerse grande. (Ver Tamaños de Mario)   |
| Invencibilidad / Estrella    | Hace a Mario invencible hasta que se acabe la canción del power-up, nada le podrá dañar excepto ser aplastado o caerse al vacío. |
| Botas de salto| Aumenta el límite de salto que puede realizar Mario. (Ver salto básico)                        |
| Lanza Martillos| Pulsando el botón de acción Mario podrá lanzar unos martillos. La dirección de estos será una parábola y solamente tendrán colisión con los enemigos, siendo destruidos en impacto con ellos. Solo podrá haber un martillo en pantalla (Para limitar la cantidad de martillos seguidos)                        |
| Doble salto| Permite hacer un doble salto a Mario, cuando se acaba el doble salto se podrá seguir haciendo la vuelta en el aire.                      |

### 3.6  **Sistema de puntuación**

El jugador comienza el primer nivel con 0 puntos. El jugador gana puntos
por:

1.  Recoger monedas (Ver [Objetos Recolectables]).

2.  Matar enemigos. Todos los enemigos dan la misma puntuación de +200.

3.  Romper bloques. Cada bloque da +10 de puntuación.

4.  Recoger un objeto. Cada objeto proporciona una puntuación diferente
    (Ver [Objetos Recolectables]).

5.  La puntuación de la bandera (Cuanto más arriba la barra mayor es la 
    puntuación).

6.  El tiempo restante. Cada segundo restante da +100 de puntuación.

La puntuación se pasa de un nivel al siguiente. Al terminar la partida,
la puntuación máxima es actualizada con la puntuación conseguida por el
jugador en la última partida.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Puntos       | Registran y cuantifican las acciones del jugador. No afectan directamente a la progresión del juego   | Números naturales       |

## 4.  **Interfaz**

### 4.1  **Controles**

Los controles del juego son los siguientes:

-   Clic izquierdo: el jugador salta.

-   Clic derecho: el jugador usa el Power-up que tiene. Si no tiene
    ninguno, no hace nada.

![Controles](./assets/GDD_Images/Controles.png "ControlesImag")

### 4.2  **Cámara**

La cámara sigue al jugador progresivamente a lo largo del nivel, aunque
mantiene el mismo nivel de zoom.

### 4.3  **HUD**

El HUD contiene información sobre:

-   Nº de Monedas Doradas

-   Tiempo Restante

-   Nº de Monedas Moradas

-   Puntuación actual

-   Nº de burbujas restantes

### 4.4  **Menús**

El juego tiene una primera pantalla de título. Al pasar de dicha
pantalla, se llega a la pantalla de selección de nivel, donde el
jugador, como su propio nombre indica, seleccionará el nivel que quiere
jugar (aunque los debe desbloquear primero completándolos en orden).
Finalmente, se encuentran los propios niveles.

<img src="./assets/GDD_Images/Portada.png" width=200 height=200>
<img src="./assets/GDD_Images/PantallaCarga.png" width=200 height=200>
<img src="./assets/GDD_Images/PantallaTitulo.png" width=200 height=200>
<img src="./assets/GDD_Images/SeleccionNivel.png" width=200 height=200>
<!-- ![Portada](./assets/GDD_Images/Portada.png "PortadaImag")
![Carga](./assets/GDD_Images/PantallaCarga.png "CargaImag")
![PantallaTitulo](./assets/GDD_Images/PantallaTitulo.png "TituloImag")
![SelecNivel](./assets/GDD_Images/SeleccionNivel.png "SelecNivelImag") -->

(*Imagenes provisionales para servir de ejemplo*)

![Diagrama](./assets/GDD_Images/DiagramaMenus.png "DiagramaImag")

## 5.  **Mundo del juego**

### 5.1  **Personajes**

#### 5.1.1  **Mario**

<img src="./assets/GDD_Images/Mario.png" width=50 height=50>
Mario es el protagonista del juego y es la representación del jugador
dentro del juego. Su comportamiento se describe en la sección de
[mecánicas]. Las dimensiones de Mario se describen en [Tamaños de
Mario].

#### 5.1.2  **Zagreus**

<img src="./assets/GDD_Images/Zagreus.png" width=50 height=100>
Zagreus actúa como la clásica damisela en peligro (Princesa Peach) de 
los juegos de Mario. Sirve como motivación para que Mario se embarque 
en la aventura.

#### 5.1.3  **Enemigos**

Dentro del juego hay varios tipos de enemigos que pueden matar al
jugador. Todos tienen un conjunto de comportamientos comunes:

-   Si un enemigo colisiona con el jugador, le hace daño (ver [Tamaños 
    de Mario]).

-   Si Mario salta encima del enemigo, lo elimina (ver 
    [Salto]) y aumenta la 
    puntuación del jugador. Cada enemigo da una puntuación diferente.

-   Los enemigos aparecen en posiciones fijas preestablecidas al comenzar cada nivel.

-   Se mantienen inmóviles hasta que no aparezcan en pantalla.

A continuación se describen las particularidades de cada tipo de enemigo
del juego:

##### 5.1.3.1   **Goomba**

Se mueve en horizontal hacia la izquierda, dándose la vuelta cuando
encuentra un obstáculo.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad      | Velocidad máxima con la que se mueve el enemigo.   | m/s       |
| Puntos    | Puntuación otorgada al ser derrotado por el jugador | Número natural       |

##### 5.1.3.2   **Koopa**

Mismo funcionamiento que el Goomba.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad      | Velocidad máxima con la que se mueve el enemigo.   | m/s       |
| Puntos    | Puntuación otorgada al ser derrotado por el jugador | Número natural       |

3.   **Pokey**

Se mueve muy lento y se compone de varias bolas de pinchos encima las
unas de las otras que conforman su cuerpo, hasta llegar a la cabeza. Al
ser golpeado con un Power-Up como el martillo su cuerpo entero se destruirá, sin embargo, no puede ser pisado como los Goombas o Koopas.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad      | Velocidad máxima con la que se mueve el enemigo.   | m/s       |
| Puntos    | Puntuación otorgada al ser derrotado por el jugador | Número natural       |
| Cantidad del cuerpo      | Número de bolas que tiene que no son la cabeza   | Número natural        |
| Tamaño del cuerpo    | Dimensión que ocupa en el espacio con las bolas | m       |

##### 5.1.3.4   **Planta Piraña**

Sale de las tuberías periódicamente y daña a Mario si entran en
contacto. Se destruye al ser golpeada con el Power-Up del martillo.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Tiempo escondido en la tubería      | Tiempo en el que permanecerá en la tubería   | s       |
| Tiempo fuera de la tubería    | Tiempo en el que permanecerá fuera de la tubería | s       |
| Puntos      | Puntuación otorgada al ser derrotado por el jugador   | Número natural        |

#### 5.1.4  Bosses

Enemigos que se encuentran al final de cada nivel, respectivamente.
Todos ellos comparten ciertas características:

-   Se encuentran alejados del movimiento del jugador, podrán
    desplazarse por el escenario y Mario no podrá chocarse con ellos.

-   Van invocando enemigos a medida que avanza la pelea.

-   Es necesario sobrevivir un determinado tiempo contra ellos para 
    finalizar el nivel.

##### 5.1.4.1 **Júpiter**

<img src="./assets/GDD_Images/Zeus.png" width=50 height=50>
Es el primer boss. Cada cierto tiempo, Júpiter se preparará para
lanzar un rayo. Dicho rayo será precedido por una
línea de predicción durante la carga del mismo, para avisar al jugador y
que lo pueda esquivar. Durante la pelea, el jugador será perseguido por una tormenta gigante que le atrapará y matará si le atrapa. Además, el boss invocará enemigos característicos de su nivel correspondiente.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad de la tormenta     | Velocidad a la que se mueve la tormenta que persigue al jugador durante la pelea.   | m/s       |
| Duración del rayo      | Tiempo de existencia del rayo lanzado por el boss antes de desaparecer.   | s       |
| Duración de la carga del rayo    | Tiempo de existencia de la línea de predicción del rayo antes de desaparecer. | s       |


##### 5.1.4.2  **Horus**

<img src="./assets/GDD_Images/Horus.png" width=50 height=70>
Es el segundo boss. Irá lanzando ráfagas de viento con el objetivo de enviar al jugador hacia la tormenta de arena y también arrastrará a los enemigos. También podrá crear columnas que el jugador deberá evitar para no quedarse quieto. Además, invocará enemigos característicos de su nivel.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad de la tormenta de arena     | Velocidad a la que se mueve la tormenta de arena que persigue al jugador durante la pelea.   | m/s       |
| Cantidad de columnas por oleada    | Cantidad de columnas que envía el boss cada vez que realiza el ataque. | Número natural       |


##### 5.1.4.3  **Hades**

<img src="./assets/GDD_Images/Hades.png" width=50 height=70>
Es el último boss. Su escenario será por un camino lleno de obstáculos
mientras el jugador es perseguido por una columna de almas que matarán al jugador al tocarlo. Si el jugador choca con los obstáculos, la columna de almas se acercará más. A su vez, Hades lanzará
fuegos fatuos al jugador, que le ralentizarán al contacto. Además,
invocará enemigos característicos de su nivel.

| Parámetro            | Descripción                                                 | Unidad |
|-----------------------|-------------------------------------------------------------|---------|
| Velocidad de la columna de almas     | Velocidad a la que se mueve la columna de almas que persigue al jugador durante la pelea.   | m/s       |
| Velocidad de los fuegos fatuos    | Velocidad a la que se mueven los fuegos fatuos que lanza el boss. | m/s       |
| Porcentaje de ralentización de los fuegos      | Porcentaje de ralentización que se aplicará al jugador tras tocar un fuego fatuo.   | Número natural        |
| Tiempo de ralentización del jugador    | Tiempo que estará ralentizado el jugador tras ser tocado por un fuego fatuo. | s       |

### 5.2  **Obtención de power-Ups**

Los power-ups aparecerán cuando Mario salte debajo de un bloque "?". Al
salir los objetos se desplazarán hacia la derecha. Todos los objetos
tendrán unas dimensiones de 1m x 1m. Todos proporcionarán la misma
cantidad de puntos a la hora de ser recogidos. A excepción del champiñón
y de la estrella de invencibilidad sólo se podrá tener equipado un
power-up a la vez, eso es que cuando se recoge un objeto nuevo el que se
tenía equipado previamente dejará de ser equipado. Cuando el jugador sea
dañado se quitará el power-up, si es dañado con el champiñón mario
reducirá su tamaño, al ser dañado en ese estado volverá a una parte
anterior del nivel en una burbuja, el jugador podrá salir de esta
burbuja en su estado reducido al pulsar el botón de salto.

### 5.3  **Objetos del escenario**

| Objeto            | Descripción                                                 |
|-----------------------|-------------------------------------------------------------|
| Bloques “?” que dan objetos / Power-Ups       | Bloques que al saltar contra ellos generan un objeto / Power-Up. Mario deberá darle con la cabeza al bloque para que suelte un objeto. El bloque soltará un champiñón si Mario está en su estado pequeño, si no, soltará un power up aleatorio.   |
| Bloques destructibles    | Bloques que al saltar contra ellos se destruyen. Solo se pueden destruir si Mario es de tamaño grande. |
| Pinchos| Al entrar en contacto, si Mario era de tamaño grande pasa a ser de tamaño pequeño, si Mario era de tamaño pequeño se va en una burbuja hacia atrás hasta que el jugador pulse la tecla de salto para salir de esta.                       |
| Rampas       | Hacia arriba, los personajes jugables y no jugables caminarán más lento. Hacia abajo, irán más rápido.   |
| Plataformas que se caen       | Plataformas que se caen cuando Mario pasa sobre ellas, estas se regeneran si Mario entra en su estado burbuja.   |
| Bloque Pausa       | Al estar sobre este bloque, Mario se detiene un instante para ver la parte derecha de la pantalla, el temporizador del nivel se detendrá también.   |
| Bloque que al pasar sobre él muestra un camino de monedas       | Cuando Mario colisiona sobre este bloque (no tiene físicas, se atravesará), se muestra un camino de monedas. Si no se pasa sobre este bloque, esas monedas no se podrán conseguir.   |
| Orbe de salto extra (tres intensidades)       | Al pulsar el botón de salto sobre alguno de estos orbes Mario realizará un salto extra. Habrá tres intensidades con diferentes alturas.   |

### 5.4  **Niveles**

Los niveles serán bellos y variados. Serán una composición con
obstáculos y enemigos característicos del nivel en el que nos
encontremos.

Después de cada nivel estará esperando un jefe con una serie de ataques
que se deberán evitar, si se sobrevive lo suficiente se completará el
jefe.

## 6. Experiencia de juego

El juego empieza con un tutorial por la escena de un nivel de Mario,
pudiendo ver al protagonista, al fondo y al suelo por el que tendrá que
caminar.

Cada elemento que sale en la interfaz de la pantalla aumenta cuando se
realiza una determinada acción como derrotar enemigos, recoger
[monedas] y objetos. Las
[burbujas] sólo podrán disminuir, ya
sea cuando el jugador es dañado en su estado pequeño o cuando se caiga
al vacío.

En la siguiente imagen se muestra una idea de lo que podrá ver el
jugador durante el nivel, se mostrarán el número de
[burbujas] que tiene, su
[puntuación], número de
[monedas], secretas y generales de
cada nivel, y, el tiempo que tiene para completar el nivel.

Durante el nivel también se podrán recoger unos
[power-ups] que proporcionarán
habilidades específicas al jugador, ayudando a que la experiencia sea
más amena, incluso dando posibilidad a descubrir caminos secretos para
recoger [monedas especiales].

![Mockup1](./assets/GDD_Images/MockupBosque.png "Mockup1Imag")

**Boceto con la idea general del juego (no completo), se incluye:**

<img src="./assets/GDD_Images/Tiempo.png" width=70 height=70>**Sistema de límite de tiempo**

<img src="./assets/GDD_Images/Monedas.png" width=70 height=70>**Monedas generales del nivel**

<img src="./assets/GDD_Images/Burbujas.png" width=70 height=70>**Límite de burbujas del nivel**

<img src="./assets/GDD_Images/Martillo.png" width=50 height=70>**Recogida de
power-ups a partir de un bloque**

<img src="./assets/GDD_Images/Salto.png" width=50 height=70>**Salto del personaje**

<img src="./assets/GDD_Images/Goomba.png" width=70 height=70>**Movimiento de los enemigos**

<img src="./assets/GDD_Images/Puntos.png" width=140 height=70>**Puntuación total del nivel**

<img src="./assets/GDD_Images/Monedas_secretas.png" width=140 height=70>**Monedas secretas recogidas**

Después de cada nivel principal se interpondrá un jefe acorde a cada
mitología. El jugador deberá de evitar sus ataques durante un cierto
periodo de tiempo. Los ataques que realizará el boss se avisarán
previamente por un indicativo visual y auditivo para la capacidad de
reacción del jugador.

![Mockup2](./assets/GDD_Images/MockupEgipto.png "Mockup2Imag")

<img src="./assets/GDD_Images/Pokey.png" width=70 height=70>**Destrucción
por bolas enemigo pokey**

<img src="./assets/GDD_Images/Moneda_roja.png" width=70 height=70>**Moneda Secreta**

<img src="./assets/GDD_Images/Koopa.png" width=70 height=70>**Decoración enemigos**

<img src="./assets/GDD_Images/Pausa.png" width=70 height=70>**[Bloque
pausa]**

<img src="./assets/GDD_Images/BloqueAparicionMonedas.png" width=70 height=70>**[Bloque aparición
monedas]**

<img src="./assets/GDD_Images/Destructible.png" width=70 height=70>**Bloques destructibles**

<img src="./assets/GDD_Images/BossFight.png" width=500 height=270><tr>En esta imagen se puede ver:
<li><strong>Al jefe que atacará de vez en cuando</li>
<li>A Mario corriendo más rápido que antes</li>
<li>Al Ataque del jefe que “intentará” golpear a Mario
(lanzará el ataque para que Mario lo pueda esquivar) </li>
</tr>
</strong>


### 6.1 Experiencia de cada nivel

**Nivel tutorial:**

Durante este nivel el jugador tendrá que aprender las habilidades
básicas como saltar, obtener y usar power-ups, saltar sobre enemigos y
hacerse al movimiento del jugador.

También habrán monedas escondidas para indicar que los niveles son
explorables en cierta manera que incentiva a recoger objetos.

Al final de este estará la tubería que llevará a Mario a Roma.

**Primer nivel**:

En este nivel los enemigos tendrán una apariencia similar a los Romanos,
atacando como los enemigos de Mario para que no pille al jugador de
sorpresa, pudiendo introducir una nueva mecánica del escenario para
hacer variada la experiencia de juego.

**Boss 1:**

El primer jefe del juego será el más corto, indicando previamente dónde
llegarán los ataques que se lanzarán al jugador. Para completarlo será
necesario sobrevivir una serie de ataques, dando paso a la siguiente
mitología.

**Segundo nivel:**

El segundo nivel introducirá dos mecánicas nuevas asociadas a la
mitología egipcia, con ello se podrá desbloquear otro power-up y
seguidamente continuar con el nivel con otra estética y escenografía, al
igual que los enemigos.

**Boss 2:**

Tutankoopa modificará el escenario y Mario tendrá que ser capaz de
evitar los obstáculos, dando paso a la siguiente mitología.

**Tercer nivel:**

Este último nivel estará ambientado en la antigua grecia, será el nivel
más difícil de todos, con plataformas precias, caminos complicados y
monedas escondidas a través de un camino secreto. Al final de este
estará esperando el boss final del juego.

**Boss 3:**

El tercer boss aplicará todas las mecánicas introducidas anteriormente y
durará más que el primero. Al aguantar lo suficiente
Zagreus nos estará esperando encerrado.

## 7. Estética y contenido

Se tratará de 3 niveles distintos, junto con su salas de bosses después
de cada nivel, cada una con su estética inspirada en las mitologías
romanas, egipcias y griegas. Los sprites serán de 32 píxeles.

Además de eso, adaptamos unos enemigos de Mario a la mitología en la que
se sitúan. En la egipcia serán ambientados en el paisaje arenoso y
ardiente, en la romana adaptamos al dios del trueno junto con otros
elementos como los martillos que fabricaría hefesto, y, en la griega
adaptamos al infierno.

En la parte sonora, se implementarán sonidos característicos de Mario
cuando se salta, se rompe un bloque, se obtiene un power-up, cuando se
usa una habilidad, cuando se recibe daño, cuando se lanza un martillo,
en los menús, entre otros. Además, la música intentará ser una mezcla de
Mario y del paisaje mitológico en el que se encuentra.

Entre los efectos aplicados serán: humo, chispas y efectos de impacto.
Cada uno de estos efectos aparecerán cuando se realice una acción como
correr, saltar, derrotar enemigos y recoger monedas.

Las animaciones del jugador van a ser: correr, saltar, caer, saltar
encima de algo, recoger un power-up, lanzar un martillo, ser dañado,
además de los enemigos que estarán presentes por el nivel y el fondo y
los bosses.

## 8.  **Producción**

### 8.1  **Planificación (roadmap)**

[**[RoadMapW9]**](https://docs.google.com/spreadsheets/d/14TWWS0c-vvL7ow5dCLY1PFPF8hPG8OodMv74Icd5OO4/edit?gid=272136489#gid=272136489)

## 9.  **Referencias**

Estas son las referencias usadas para entender este documento.

-   Estética y decoración \_ [[Super Mario\'s Wacky Worlds, Philips, 
    Cancelado]](https://archive.org/details/super-marios-wacky-worlds-cd-i-beta-all-levels)

-   Algunos de los objetos de interacción con el escenario \_ [[Geometry Dash, RobTop Games,
    2013]](https://es.wikipedia.org/wiki/Geometry_Dash)

-   Principal bucle de juego y mecánicas \_ [[Super Mario Run, Nintendo, 2016]](https://es.wikipedia.org/wiki/Super_Mario_Run)

-   Inspiración de los niveles bosses \_ [[RayMan Legends, Ubisoft, 2013]](https://www.youtube.com/watch?v=yT6XOfy2gEE)

-   Ideas de estética y mecánicas para boss \_ [[Cuphead: Djimmi the Great Boss Fight #7]](https://www.youtube.com/watch?v=O7Ti2DqPpRM)

## 10. **Fechas Importantes y Requerimientos de Entregas**

-   Hito 0 *(Fecha Límite)* : 26 de septiembre 23:59 CEST

    -   Pdf: [No hay] *(Requisitos abajo)*

        -   Las 4 cartas a utilizar (código de carta y nombre de carta).

            -   Mario (P15)

            -   Fez (M11)

            -   Mitología (A22)

            -   Zagreus (P18)

        <img src="./assets/GDD_Images/CartaMario.png" width=70 height=90> <img src="./assets/GDD_Images/CartaFez.png" width=70 height=90> <img src="./assets/GDD_Images/CartaMitologia.png" width=70 height=90> <img src="./assets/GDD_Images/CartaZagreus.png" width=70 height=90>

-   Resumen de la idea del juego:

    -   Super Mario: Lost Kingdoms es un juego en el que Mario avanza
        sin necesidad de indicaciones de dirección. Se moverá hacia la
        derecha y aparecerán obstáculos y enemigos por su camino que
        deberán ser confrontados. Mario podrá obtener un número de
        Power-Ups que darán una ventaja al jugador e incluso
        habilidades para explorar zonas que antes no se podrían.
        Después de cada nivel el protagonista se enfrentará a diversos
        jefes que lanzarán ataques que deberán ser evitados.

-   [[Enlace a Github con el repositorio del proyecto]](https://github.com/Janime-UCM555/PVLI_WorldNine).

#


