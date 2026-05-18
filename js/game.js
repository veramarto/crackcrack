const config = {
    type: Phaser.AUTO,
    parent: 'joc-phaser',
    width: 800,
    height: 450,
    backgroundColor: '#CFEBFF',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },

    scene: [
        PantallaTitol,
        PantallaCarrega,
        Nivell1,
        Nivell2,
        PantallaFinal
    ]
};

const joc = new Phaser.Game(config);

const AMPLADA_MON = 2200;

let jugador;
let tecles;
let llistaPlataformes = [];
let llistaPlataformesMobils = [];
let ous;
let enemics;
let puntuacio = 0;
let textPuntuacio;
let estaMort = false;
let haGuanyat = false;

// -------------------------
// PANTALLA DE TÍTOL
// -------------------------

function PantallaTitol() {
    Phaser.Scene.call(this, { key: 'PantallaTitol' });
}

PantallaTitol.prototype = Object.create(Phaser.Scene.prototype);
PantallaTitol.prototype.constructor = PantallaTitol;

PantallaTitol.prototype.create = function () {
    this.add.text(400, 90, 'CRACK CRACK', {
        fontSize: '54px',
        color: '#402105',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 170, 'Ajuda el Sr. Eggou a rescatar la seva dotzena!', {
        fontSize: '22px',
        color: '#402105'
    }).setOrigin(0.5);

    this.add.text(400, 230, 'Fletxes: moure i saltar\nRecull els ous i esquiva ganivets i focs', {
        fontSize: '20px',
        color: '#402105',
        align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 340, 'Prem ESPAI per començar', {
        fontSize: '26px',
        color: '#FFFFFF',
        backgroundColor: '#402105',
        padding: { x: 18, y: 10 }
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('PantallaCarrega');
    });
};

// -------------------------
// PANTALLA DE CÀRREGA
// -------------------------

function PantallaCarrega() {
    Phaser.Scene.call(this, { key: 'PantallaCarrega' });
}

PantallaCarrega.prototype = Object.create(Phaser.Scene.prototype);
PantallaCarrega.prototype.constructor = PantallaCarrega;

PantallaCarrega.prototype.preload = function () {
    this.add.text(400, 190, 'Carregant assets...', {
        fontSize: '28px',
        color: '#402105'
    }).setOrigin(0.5);

    this.load.spritesheet('eggou', 'assets/eggou_spritesheet.png', {
        frameWidth: 126,
        frameHeight: 126
    });

    this.load.image('foc', 'assets/Foc.png');
    this.load.image('ganivet', 'assets/Ganivet.png');
    this.load.image('huevet', 'assets/Huevet.png');
    this.load.image('tilesCuina', 'assets/tileset.png');

    this.load.tilemapTiledJSON('mapaNivell1','assets/mapa_nivell1.json');
};

PantallaCarrega.prototype.create = function () {
    this.scene.start('Nivell1', { puntuacio: 0 });
};

// -------------------------
// NIVELL 1
// -------------------------

function Nivell1() {
    Phaser.Scene.call(this, { key: 'Nivell1' });
}

Nivell1.prototype = Object.create(Phaser.Scene.prototype);
Nivell1.prototype.constructor = Nivell1;

Nivell1.prototype.create = function (dades) {
    configurarNivell(this, dades.puntuacio || 0, 1);
};

Nivell1.prototype.update = function () {
    actualitzarNivell(this);
};

// -------------------------
// NIVELL 2
// -------------------------

function Nivell2() {
    Phaser.Scene.call(this, { key: 'Nivell2' });
}

Nivell2.prototype = Object.create(Phaser.Scene.prototype);
Nivell2.prototype.constructor = Nivell2;

Nivell2.prototype.create = function (dades) {
    configurarNivell(this, dades.puntuacio || 0, 2);
};

Nivell2.prototype.update = function () {
    actualitzarNivell(this);
};

// -------------------------
// PANTALLA FINAL
// -------------------------

function PantallaFinal() {
    Phaser.Scene.call(this, { key: 'PantallaFinal' });
}

PantallaFinal.prototype = Object.create(Phaser.Scene.prototype);
PantallaFinal.prototype.constructor = PantallaFinal;

PantallaFinal.prototype.create = function (dades) {
    const victoria = dades.victoria;
    const puntuacioFinal = dades.puntuacio || 0;

    this.add.text(400, 130, victoria ? 'VICTÒRIA!' : 'GAME OVER', {
        fontSize: '56px',
        color: victoria ? '#2E8B57' : '#B22222',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 210, victoria
        ? 'Has rescatat la dotzena del Sr. Eggou!'
        : 'El Sr. Eggou no ha sobreviscut a la cuina...',
        {
            fontSize: '24px',
            color: '#402105',
            align: 'center'
        }).setOrigin(0.5);

    this.add.text(400, 270, 'Ous rescatats: ' + puntuacioFinal, {
        fontSize: '24px',
        color: '#402105'
    }).setOrigin(0.5);

    this.add.text(400, 350, 'Prem R per tornar al títol', {
        fontSize: '24px',
        color: '#FFFFFF',
        backgroundColor: '#402105',
        padding: { x: 18, y: 10 }
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
        this.scene.start('PantallaTitol');
    });
};

// -------------------------
// CONFIGURACIÓ DEL NIVELL
// -------------------------

function configurarNivell(escena, puntuacioInicial, numeroNivell) {
    puntuacio = puntuacioInicial;
    estaMort = false;
    haGuanyat = false;
    llistaPlataformes = [];
    llistaPlataformesMobils = [];

    escena.physics.world.setBounds(0, 0, AMPLADA_MON, 450);
    escena.cameras.main.setBounds(0, 0, AMPLADA_MON, 450);

    const mapa = escena.make.tilemap({
        key: 'mapaNivell1'
    });

    const tileset = mapa.addTilesetImage(
        'tileset',
        'tilesCuina'
    );

    const capaPlataformes = mapa.createLayer(
        0,
        tileset,
        0,
        0
    );

    capaPlataformes.setCollisionByExclusion([-1]);

    jugador = escena.physics.add.sprite(30, 360, 'eggou');
    jugador.setScale(0.7);
    jugador.body.setSize(45, 70);
    jugador.body.setOffset(40, 40);
    jugador.body.setCollideWorldBounds(false);
    jugador.body.setBounce(0);

    crearAnimacions(escena);

    escena.physics.add.collider(jugador, capaPlataformes);
    escena.physics.add.collider(jugador, llistaPlataformesMobils);

    escena.cameras.main.startFollow(jugador, true, 0.08, 0.08);

    tecles = escena.input.keyboard.createCursorKeys();

    ous = escena.physics.add.staticGroup();
    crearOusPerNivell(escena, numeroNivell);

    escena.physics.add.overlap(jugador, ous, recollirOu, null, escena);

    enemics = escena.physics.add.group({ allowGravity: false });
    crearEnemicsPerNivell(escena, numeroNivell);

    escena.physics.add.overlap(jugador, enemics, tocarEnemic, null, escena);

    textPuntuacio = escena.add.text(16, 16, 'Ous rescatats: ' + puntuacio, {
        fontSize: '22px',
        color: '#402105',
        backgroundColor: '#FFE448',
        padding: { x: 10, y: 6 }
    });
    textPuntuacio.setScrollFactor(0);

    escena.add.text(760, 16, 'Nivell ' + numeroNivell, {
        fontSize: '22px',
        color: '#402105',
        backgroundColor: '#FFFFFF',
        padding: { x: 10, y: 6 }
    }).setOrigin(1, 0).setScrollFactor(0);
}

function actualitzarNivell(escena) {
    if (estaMort || haGuanyat) return;

    mouJugador();
    mouEnemics();
    mouPlataformes();

    if (jugador.y > 520) {
        morir(escena);
    }
}

// -------------------------
// MAPES
// -------------------------

function crearPlataformesPerNivell(escena, numeroNivell) {
    if (numeroNivell === 1) {
        crearPlataforma(escena, 300, 430, 600, 40);
        crearPlataforma(escena, 850, 430, 420, 40);
        crearPlataforma(escena, 1350, 430, 420, 40);
        crearPlataforma(escena, 1850, 430, 500, 40);

        crearPlataforma(escena, 450, 330, 180, 24);
        crearPlataforma(escena, 850, 300, 180, 24);
        crearPlataforma(escena, 1250, 330, 180, 24);
        crearPlataforma(escena, 1650, 300, 180, 24);

    } else {
        crearPlataforma(escena, 180, 430, 360, 40);
        crearPlataforma(escena, 620, 430, 300, 40);
        crearPlataforma(escena, 1050, 430, 360, 40);
        crearPlataforma(escena, 1520, 430, 340, 40);
        crearPlataforma(escena, 1980, 430, 420, 40);

        crearPlataforma(escena, 300, 330, 180, 24);
        crearPlataforma(escena, 560, 260, 170, 24);
        crearPlataforma(escena, 840, 340, 180, 24);
        crearPlataforma(escena, 1110, 270, 190, 24);
        crearPlataforma(escena, 1390, 330, 180, 24);
        crearPlataforma(escena, 1660, 245, 200, 24);
        crearPlataforma(escena, 1900, 325, 190, 24);

        crearPlataformaMobil(escena, 720, 180, 150, 20, 600, 850, 1.2);
        crearPlataformaMobil(escena, 1260, 180, 150, 20, 1160, 1390, 1.4);
        crearPlataforma(escena, 1780, 150, 160, 22);
    }
}

function crearOusPerNivell(escena, numeroNivell) {
    if (numeroNivell === 1) {
        crearOu(escena, 450, 290);
        crearOu(escena, 850, 260);
        crearOu(escena, 1250, 290);
        crearOu(escena, 1850, 260);
    } else {
        crearOu(escena, 300, 290);
        crearOu(escena, 560, 220);
        crearOu(escena, 720, 140);
        crearOu(escena, 1110, 230);
        crearOu(escena, 1260, 140);
        crearOu(escena, 1660, 205);
        crearOu(escena, 1900, 285);
        crearOu(escena, 2150, 385);
    }
}

function crearEnemicsPerNivell(escena, numeroNivell) {
    if (numeroNivell === 1) {
        crearGanivet(escena, 700, 385, 620, 950, -1.0);
        crearGanivet(escena, 1150, 295, 1040, 1320, 0.8);

        crearFoc(escena, 1450, 385, 300, 405, 0.7);
        crearFoc(escena, 1700, 255, 230, 320, 0.6);

    } else {
        crearGanivet(escena, 500, 385, 430, 760, -1.4);
        crearGanivet(escena, 760, 145, 640, 860, 0.8);
        crearGanivet(escena, 1030, 385, 900, 1210, 1.3);
        crearGanivet(escena, 1470, 205, 1320, 1540, -1.1);
        crearGanivet(escena, 1760, 385, 1580, 2050, -1.5);

        crearFoc(escena, 590, 215, 160, 275, 0.7);
        crearFoc(escena, 680, 385, 300, 405, 0.8);
        crearFoc(escena, 1330, 385, 285, 405, 0.9);
        crearFoc(escena, 1730, 170, 110, 260, 0.8);
        crearFoc(escena, 1960, 285, 220, 360, 0.8);
    }
}

// -------------------------
// CREACIÓ D'OBJECTES
// -------------------------

function crearPlataforma(escena, x, y, amplada, alcada) {
    const plataforma = escena.add.rectangle(x, y, amplada, alcada, 0x402105);
    escena.physics.add.existing(plataforma, true);

    escena.add.rectangle(x, y - alcada / 2, amplada, 4, 0xFFE448);

    llistaPlataformes.push(plataforma);
}

function crearPlataformaMobil(escena, x, y, amplada, alcada, minX, maxX, velocitat) {
    const plataforma = escena.add.rectangle(x, y, amplada, alcada, 0x5A2A0A);
    escena.physics.add.existing(plataforma, true);

    const liniaSuperior = escena.add.rectangle(x, y - alcada / 2, amplada, 4, 0xFFE448);
    plataforma.liniaSuperior = liniaSuperior;

    plataforma.minX = minX;
    plataforma.maxX = maxX;
    plataforma.velocitat = velocitat;

    llistaPlataformesMobils.push(plataforma);
}

function crearOu(escena, x, y) {
    const ou = escena.physics.add.sprite(x, y, 'huevet');

    ou.setScale(0.18);
    ou.body.allowGravity = false;
    ou.body.setImmovable(true);

    ous.add(ou);
}

function crearGanivet(escena, x, y, minX, maxX, velocitat) {
    const ganivet = escena.physics.add.sprite(x, y, 'ganivet');

    ganivet.setScale(0.18);
    ganivet.body.allowGravity = false;
    ganivet.body.setSize(180, 40);
    ganivet.body.setOffset(20, 60);

    ganivet.velocitat = velocitat;
    ganivet.minX = minX;
    ganivet.maxX = maxX;
    ganivet.tipusEnemic = 'ganivet';

    enemics.add(ganivet);
}

function crearFoc(escena, x, y, minY, maxY, velocitat) {
    const foc = escena.physics.add.sprite(x, y, 'foc');

    foc.setScale(0.18);
    foc.body.allowGravity = false;
    foc.body.setSize(80, 100);
    foc.body.setOffset(20, 10);

    foc.velocitat = velocitat;
    foc.minY = minY;
    foc.maxY = maxY;
    foc.tipusEnemic = 'foc';

    enemics.add(foc);
}

// -------------------------
// MOVIMENT
// -------------------------

function jugadorTocaTerra() {
    return jugador.body.touching.down || jugador.body.blocked.down;
}

function jugadorTocaTerra() {
    return jugador.body.touching.down || jugador.body.blocked.down;
}

function mouJugador() {

    if (tecles.left.isDown) {

        jugador.body.setVelocityX(-220);
        jugador.setFlipX(true);

        if (jugadorTocaTerra()) {
            jugador.anims.play('walk', true);
        }

    } else if (tecles.right.isDown) {

        jugador.body.setVelocityX(220);
        jugador.setFlipX(false);

        if (jugadorTocaTerra()) {
            jugador.anims.play('walk', true);
        }

    } else {

        jugador.body.setVelocityX(0);

        if (jugadorTocaTerra()) {
            jugador.anims.play('idle', true);
        }
    }

    if (tecles.up.isDown && jugadorTocaTerra()) {
        jugador.body.setVelocityY(-430);
    }

    if (!jugadorTocaTerra()) {

        jugador.anims.stop();

        if (jugador.body.velocity.y < 0) {
            jugador.setFrame(8);
        } else {
            jugador.setFrame(9);
        }
    }
}

function mouPlataformes() {
    for (let i = 0; i < llistaPlataformesMobils.length; i++) {
        const plataforma = llistaPlataformesMobils[i];

        plataforma.x += plataforma.velocitat;
        plataforma.liniaSuperior.x = plataforma.x;

        if (plataforma.x <= plataforma.minX) {
            plataforma.x = plataforma.minX;
            plataforma.velocitat = Math.abs(plataforma.velocitat);
        }

        if (plataforma.x >= plataforma.maxX) {
            plataforma.x = plataforma.maxX;
            plataforma.velocitat = -Math.abs(plataforma.velocitat);
        }

        plataforma.body.updateFromGameObject();
    }
}

function mouEnemics() {
    const arrayEnemics = enemics.getChildren();

    for (let i = 0; i < arrayEnemics.length; i++) {
        const enemic = arrayEnemics[i];

        if (enemic.tipusEnemic === 'foc') {
            enemic.y += enemic.velocitat;

            if (enemic.y <= enemic.minY) {
                enemic.y = enemic.minY;
                enemic.velocitat = Math.abs(enemic.velocitat);
            }

            if (enemic.y >= enemic.maxY) {
                enemic.y = enemic.maxY;
                enemic.velocitat = -Math.abs(enemic.velocitat);
            }

        } else {
            enemic.x += enemic.velocitat;

            if (enemic.x <= enemic.minX) {
                enemic.x = enemic.minX;
                enemic.velocitat = Math.abs(enemic.velocitat);
                enemic.setFlipX(true);
            }

            if (enemic.x >= enemic.maxX) {
                enemic.x = enemic.maxX;
                enemic.velocitat = -Math.abs(enemic.velocitat);
                enemic.setFlipX(false);
            }
        }

        enemic.body.updateFromGameObject();
    }
}

// -------------------------
// ANIMACIONS
// -------------------------

function crearAnimacions(escena) {
    if (!escena.anims.exists('idle')) {
        escena.anims.create({
            key: 'idle',
            frames: escena.anims.generateFrameNumbers('eggou', {
                start: 0,
                end: 3
            }),
            frameRate: 7,
            repeat: -1
        });
    }

    if (!escena.anims.exists('walk')) {
        escena.anims.create({
            key: 'walk',
            frames: escena.anims.generateFrameNumbers('eggou', {
                start: 4,
                end: 7
            }),
            frameRate: 7,
            repeat: -1
        });
    }

    if (!escena.anims.exists('death')) {
        escena.anims.create({
            key: 'death',
            frames: escena.anims.generateFrameNumbers('eggou', {
                start: 10,
                end: 13
            }),
            frameRate: 7,
            repeat: 0
        });
    }

    jugador.anims.play('idle');
}

// -------------------------
// ESTATS DEL JOC
// -------------------------

function recollirOu(jugador, ou) {
    ou.destroy();

    puntuacio += 1;
    textPuntuacio.setText('Ous rescatats: ' + puntuacio);

    const escenaActual = jugador.scene;

    if (escenaActual.scene.key === 'Nivell1' && puntuacio >= 4) {
        haGuanyat = true;
        escenaActual.scene.start('Nivell2', { puntuacio: puntuacio });
    }

    if (escenaActual.scene.key === 'Nivell2' && puntuacio >= 12) {
        guanyar(escenaActual);
    }
}

function tocarEnemic(jugador, enemic) {
    morir(jugador.scene);
}

function morir(escena) {
    if (estaMort || haGuanyat) return;

    estaMort = true;

    jugador.body.setVelocity(0, 0);
    jugador.body.allowGravity = false;

    jugador.anims.play('death', true);

    textPuntuacio.setText('GAME OVER');

    escena.time.delayedCall(1200, function () {
        escena.scene.start('PantallaFinal', {
            victoria: false,
            puntuacio: puntuacio
        });
    });
}

function guanyar(escena) {
    if (haGuanyat || estaMort) return;

    haGuanyat = true;

    jugador.body.setVelocity(0, 0);
    jugador.anims.play('idle', true);

    textPuntuacio.setText('HAS RESCATAT LA DOTZENA!');

    escena.time.delayedCall(1200, function () {
        escena.scene.start('PantallaFinal', {
            victoria: true,
            puntuacio: puntuacio
        });
    });
}