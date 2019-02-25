
/*  Author : Charlou E. Nicolas */



window.onload = function () {


    var game, config;

    var username = document.getElementById('username');

    username.value = 'Player' + Math.floor(Math.random() * 99999 );


    var btn = document.getElementById ('btnEnter');

    var form = document.getElementById ('myForm');

    form.onsubmit = function ( e ) {

        e.preventDefault();

        if ( username.value != '' ) {

            document.getElementById('game_login').style.display = 'none';
            document.getElementById('game_div').style.display = 'block';
            
            enterGame ();
        }
    }

    function enterGame () {

        var parentDiv = document.getElementById('game_div');
    
        config = {
    
            type: Phaser.AUTO,
            width: parentDiv.clientWidth,
            height: parentDiv.clientHeight,
            backgroundColor: '#ccc',
            audio: {
                disableWebAudio: false
            },
            parent:'game_div',
            scene: [ Intro, SceneA ]
            
        };

        game = new Phaser.Game(config);
    
    }

    var Intro = new Phaser.Class({

        Extends: Phaser.Scene,

        initialize:

        function Intro ()
        {
            Phaser.Scene.call(this, { key: 'Intro' });
        },

        preload: function ()
        {

            this.load.audioSprite('sfx', 'client/assets/sfx/fx_mixdown.json', [
                'client/assets/sfx/sfx.mp3',
                'client/assets/sfx/sfx.ogg'
            ]);

            this.load.audio('introbg', ['client/assets/sfx/drumsofwar.ogg', 'assets/sfx/drumsofwar.mp3']);

            this.load.audio('bgsound', ['client/assets/sfx/siege.ogg', 'assets/sfx/siege.mp3']);

            this.load.audio('clocktick', ['client/assets/sfx/tick.ogg', 'assets/sfx/tick.mp3']);

            this.load.spritesheet('thumbs', 'client/assets/images/thumbs.png', { frameWidth: 50, frameHeight: 50 });

            this.loadtxt = this.add.text ( config.width/2, config.height/2, 'Loading Game Files...', { color : '#000', fontSize : '12px' } ).setOrigin(0.5);


            var _this = this;

            this.load.on('progress', function (value) {

                var perc = Math.floor ( value * 100 );

                _this.loadtxt.text = 'Loading Game Files.. ' + perc + '%';
        
            });
        
            this.load.on('complete', function () {
        
                _this.loadtxt.destroy();
        
            });

        },
        create : function () {

    
            this.loadtxt.destroy();

            this.bgsound = this.sound.add ('introbg').setVolume(0.2).setLoop(true);
            this.bgsound.play();

            this.music = this.sound.addAudioSprite('sfx');


            var graphics = this.add.graphics();
            graphics.fillStyle( 0x9a9a9a, 1);
            graphics.fillRect ( 0, config.height * 0.7 , config.width, config.height * 0.5 );


            var textName = this.add.text ( config.width * 0.03, config.height * 0.03, 'Hi, ' + username.value + '!', { color:'#cc5200', fontSize:15, fontFamily:'Arial', fontStyle: 'bold'  } );

            var configtxt = { color : '#000', fontSize : config.height *0.1, fontFamily:'Arial', fontStyle: 'bold' } ;

            var text = this.add.text ( config.width/2, config.height * 0.18, 'Salpakan 2.0', configtxt ).setOrigin(0.5);
            text.setStroke('#f4f4f4', 5);
            text.setShadow( 1, 1, '#666', true, true );

            var m = 5,
                r = config.width * 0.022,
                s = config.width * 0.03,
                t =  m * ( r + s ) - s;

            var xp = ( config.width - t )/2 + r/2,
                yp = config.height * 0.3;

            for ( var i=0; i<m; i++) {

                //var circ = this.add.circle ( xp + i*( r + s ), yp, r, 0x333333 );

                var star = this.add.star ( xp + i*( r + s ), yp, 5, r/2, r, 0x333333).setScale(3).setRotation(90);

                this.tweens.add ({
                    targets : star,
                    scaleX : 1,
                    scaleY : 1,
                    rotation : 0,
                    duration : 500,
                    ease : 'Power2'
                });

                var star2 = this.add.star ( xp + i*( r + s ), yp, 5, r * 0.3, r * 2 * 0.3 ,0xf5f5f5 ).setAlpha (0);

                this.tweens.add ({
                    targets : star2,
                    alpha  : 1,
                    duration : 1000,
                    ease : 'Power2',
                    delay : 500
                });


            }

            var configtxt2 = { color : '#6a6a6a', fontSize : config.height *0.03, fontFamily:'Arial', } ;
            var text2 = this.add.text ( config.width/2, config.height * 0.38, '- Select Game -', configtxt2 ).setOrigin(0.5);


            //
            var size = config.width * 0.023,
                sp = size * 0.5;

            var xp1 = config.width * 0.45,
                xp2 = xp1 + size,
                ypa = config.height * 0.45;


            var text_arr = [{name: 'Blitz', desc : '30 seconds preparation, 15 seconds per turn' },
                            {name: 'Classic', desc : '- Untimed game -' }];

            var _this = this;

            this.selectGame = 0;

            this.rects = [];

            for ( var i=0; i < 2; i++) {

                var circ = this.add.circle ( xp1 , ypa +( i * ( size + sp ) ), size/2, 0x3a3a3a  );

                this.rects.push ( circ );

                var configtxt = { fontSize: size, color : '#6a6a6a', fontFamily:'Arial' };

                var txt = this.add.text ( xp2, ypa + i * ( size + sp ), text_arr[i].name, configtxt ).setOrigin(0, 0.5);

                var rcW = config.width * 0.15,
                    rcH = size * 1.1,
                    rcX = xp1 + (rcW/2) - (size/2),
                    rcY = ypa;

                var recttop = this.add.rectangle (rcX, rcY + i * ( size + sp ), rcW, rcH  ).setInteractive().setData( 'game', i );

                recttop.on('pointerdown', function () {

                    var game_data = this.getData('game');

                    if ( game_data != _this.selectGame ) {

                        _this.selectGame = game_data;

                        _this.srect.setPosition ( _this.rects[game_data].x, _this.rects[game_data].y );

                        _this.txtDesc.setText ( text_arr[ game_data ].desc );

                    }

                    _this.music.play ('clickc');

                });


            }

            this.srect = this.add.circle ( this.rects[0].x,  this.rects[0].y, size/2*0.6, 0xff0000 );

            this.txtDesc = this.add.text ( config.width/2, config.height * 0.58, text_arr[0].desc, { fontSize: size * 0.75, color : '#ff3333', fontFamily:'Arial' }).setOrigin(0.5)

            //button...

            var bw = config.width*0.4,
                bh = config.height * 0.1,
                bx = ( config.width - bw )/2,
                by = config.height * 0.65;

            this.graphics2 = this.add.graphics();

            this.graphics2.fillStyle( 0x3a3a3a, 1);
            this.graphics2.fillRoundedRect ( bx, by, bw, bh, bh*0.1);


            var btnTxt = this.add.text ( bx + bw/2, by + bh/2, 'Play Game', { fontSize: bh * 0.5, color : '#ffffff', fontFamily:'Arial', fontStyle: 'bold'}).setOrigin(0.5);

            var playBtn = this.add.rectangle ( bx + bw/2, by + bh/2, bw, bh ).setInteractive();

            playBtn.once('pointerdown', function () {

                
                _this.bgsound.stop();

                _this.music.play ('clicka');

                _this.scene.start('sceneA', { 'game' : _this.selectGame, 'username' : username.value });
            });

            playBtn.on('pointerover', function () {
                _this.graphics2.clear();
                _this.graphics2.fillStyle( 0x6a6a6a, 1);
                _this.graphics2.fillRoundedRect ( bx, by, bw, bh, bh*0.1);
            });

            playBtn.on('pointerout', function () {
                _this.graphics2.clear();
                _this.graphics2.fillStyle( 0x3a3a3a, 1);
                _this.graphics2.fillRoundedRect ( bx, by, bw, bh, bh*0.1);
            });


            
        },


    });

    var SceneA = new Phaser.Class({

        Extends: Phaser.Scene,

        initialize:

        function SceneA ()
        {
            Phaser.Scene.call(this, { key: 'sceneA' });
        },

        init: function (data) {

            console.log ( data );

            this.grid = [];
            this.blinker = [];
            this.button = [];
            this.buttonPanel = [];
            this.controls = [];

            this.messages = [];
            this.msgelements = [];

            this.player = {};
            this.plyrInd = {};
            this.gamePiece = {};
            
            this.gamePhase = 'prep';
            this.activePiece = '';
            this.turn = '';
            this.isWinning = '';

            this.isSinglePlayer = true;
            this.isTimed = data.game == 0 ? true : false;
            this.playerName = data.username;
            this.elimScreenShown = false;
            this.isPrompted = false;
            this.isEmoji = false;
            this.isMessages = false;

            this.presetIndex = Math.floor(Math.random() * 6);

            this.maxPrepTime = 30;
            this.maxBlitzTime = 15;
            this.soundOff = false;

            this.music;
            this.timer;
            this.timeDissolve;
            this.timeDissolveWarning;

            this.timerCount = 0;
            
        },
        preload: function ()
        {
        },
        create: function () 
        {
            
            var _this = this;

            this.timer;

            this.gameWidth = config.width * 0.98;

            this.initializeGameSounds();

            this.createPanels();

            this.createGrid ();

            this.createPlayers();

            this.createPlayerIndicator ();

            this.createGamePieces('self');


            setTimeout ( function () {
                
                _this.createButtons ();

                _this.createGameControls();

                _this.startPreparations ();
        
            }, 800);

        },
        initializeGameSounds: function () {


            this.bgmusic = this.sound.add ('bgsound',);
            this.bgmusic.setLoop(true).setVolume(0.2);
            this.bgmusic.play();

            this.tick = this.sound.add ('clocktick');

            this.music = this.sound.addAudioSprite ('sfx');

        },
        createPlayers : function () {

            var names = ['Marlon', 'Ayesha', 'Rod', 'Muhammad', 'Ibrahim', 'Carlos Rodrigo' ];

            var selfType = Math.floor(Math.random() * 2),
                oppoType = selfType == 0 ? 1 : 0;

            var oppName = Math.floor(Math.random() * names.length );

            this.player [ 'self' ] = { 
                id : 'self', 
                name : this.playerName,
                wins: 0, 
                type : selfType, 
                isAI : false 
            };

            this.player [ 'oppo' ] = { 
                id : 'oppo', 
                name : names[oppName],  
                wins: 0, 
                type : oppoType,
                isAI : true 
            };
            
        },
        createGrid: function  () 
        {
            var gW = this.gameWidth/9,
                gH = config.height * 0.09,
                gX = ( config.width - this.gameWidth )/2,
                gY = config.height * 0.11;

            this.fieldY = gY;
            this.fieldHeight = gH * 8;

            var graphics = this.add.graphics();

            graphics.lineStyle (2, 0xcccccc);

            var txtConfig = {
                color : '#ccc',
                fontSize : gW * 0.11,
                fontFamily : "Arial"
            };

            var counter = 0;

            for ( var i = 0; i < 8; i++ ) {
                for ( var j = 0; j < 9; j++ ) {

                    graphics.fillStyle ( i < 4 ? 0x0000cc : 0xff0000, 1 );
                    graphics.fillRect ( gX + j*gW, gY + i*gH, gW, gH );
                    graphics.strokeRect ( gX + j*gW, gY + i*gH, gW, gH );

                    //var txt = this.add.text ( gX + j*gW, gY + i*gH, counter, txtConfig );
                    
                    this.grid. push ({
                        x : gX + j*gW + gW/2, 
                        y : gY + i*gH + gH/2,
                        width : gW,
                        height : gH,
                        row  : i,
                        col : j,
                        //isResided : false,
                        resident : '',
                        residentPlayer : ''
                    });

                    counter++;
                }    

            }
                
        },
        createPlayerIndicator: function () 
        {
            var maxWins = 3;

            var pSp = config.width * 0.008,
                pW = ( this.gameWidth - pSp ) /2,
                pH = config.height * 0.075,
                pX = ( config.width - this.gameWidth )/2 + pW/2,
                pY = (( config.height * 0.101 ) - pH )/2  + pH/2;

            
            var count=0;
            for ( var i in this.player ) {

                var pi = new PlayerIndicator (this, this.player[i].id , pX + count * (pW + pSp), 0, pW, pH, this.player[i].name, maxWins );

                this.plyrInd [ this.player[i].id ] = pi;

                this.tweens.add ({
                    targets : pi,
                    y: pY,
                    duration : 500,
                    ease : 'Elastic',
                    //delay : i * 100,
                    easeParams : [0.5, 1.1 ]
                });

                count++;
            }

        },
        createPanels: function () {

            var panelH_top = config.height * 0.101,
                panelH_bot = config.height * 0.076;

            var graphics = this.add.graphics();

            graphics.lineStyle ( 1, 0x9e9e9e );
            
            graphics.fillStyle ( 0xdedede, 1 );
            graphics.fillGradientStyle ( 0xf5f5f5, 0xf5f5f5, 0xc3c3c3, 0xc3c3c3, 1 );


            graphics.fillRect ( 0, 0, config.width, panelH_top ); //top

            graphics.beginPath();
            graphics.moveTo( 0, panelH_top );
            graphics.lineTo( config.width, panelH_top,);
            graphics.strokePath();

            graphics.fillGradientStyle ( 0xf5f5f5, 0xf5f5f5, 0xa4a4a4, 0xa4a4a4, 1 );
            graphics.fillRect ( 0, config.height - panelH_bot, config.width, panelH_bot ); // bottom
            
            graphics.beginPath();
            graphics.moveTo( 0, config.height - panelH_bot );
            graphics.lineTo( config.width, config.height - panelH_bot);
            graphics.strokePath();

            //line
            graphics.lineStyle ( 1, 0x333333 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.841 );
            graphics.lineTo( config.width * 0.2, config.height * 0.841 );
            graphics.lineTo( config.width * 0.25, config.height * 0.91 );
            graphics.lineTo( config.width * 0.75, config.height * 0.91 );
            graphics.lineTo( config.width * 0.8, config.height * 0.841 );
            graphics.lineTo( config.width, config.height * 0.841 );
            graphics.strokePath();

            graphics.lineStyle ( 1, 0xf4f4f4 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.842 );
            graphics.lineTo( config.width * 0.2, config.height * 0.842 );
            graphics.lineTo( config.width * 0.25, config.height * 0.911 );
            graphics.lineTo( config.width * 0.75, config.height * 0.911 );
            graphics.lineTo( config.width * 0.8, config.height * 0.842 );
            graphics.lineTo( config.width, config.height * 0.842 );
            graphics.strokePath();

            /* graphics.lineStyle ( 1, 0x333333 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.97 );
            graphics.lineTo( config.width  * 0.7, config.height * 0.97 );
            graphics.strokePath();

            graphics.lineStyle ( 1, 0xf4f4f4 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.971 );
            graphics.lineTo( config.width  * 0.7, config.height * 0.971  );
            graphics.strokePath();

            graphics.lineStyle ( 1, 0x333333 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.96 );
            graphics.lineTo( config.width * 0.7, config.height * 0.96 );
            graphics.strokePath();

            graphics.lineStyle ( 1, 0xf4f4f4 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.961 );
            graphics.lineTo( config.width * 0.7, config.height * 0.961  );
            graphics.strokePath();  */

            graphics.lineStyle ( 1, 0x6a6a6a );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.951);
            graphics.lineTo( config.width, config.height * 0.951  );
            graphics.strokePath();

            graphics.lineStyle ( 1, 0xf4f4f4 );
            graphics.beginPath();
            graphics.moveTo( 0, config.height * 0.952 );
            graphics.lineTo( config.width, config.height * 0.952  );
            graphics.strokePath();

            
            var txtConfig = {
                fontSize : config.height * 0.018,
                color : '#6a6a6a',
                fontFamily : 'Verdana',
                //fontStyle : 'bold'
            };

            var txt = this.add.text ( config.width * 0.012, config.height * 0.849, 'Control Panel', txtConfig ).setOrigin(0);

        },
        createButtons : function ( proper = false ) {

            var buts = [];
            
            if ( !proper ) {

                buts = [
                    { id : 'preset', value : '✽ Preset' },
                    { id : 'random', value : '❂ Random' },
                    { id : 'ready', value : '✔ Ready' }
                ];

            }else {
                
                buts = [
                    { id : 'proposedraw', value : '❂ Propose Draw' },
                    { id : 'resign', value : '✽ Resign' },
                    { id : 'showpieces', value : '✔ Reveal Pieces' }
                ];

                //if ( this.isSinglePlayer ) buts.pop();

            }

            var bS = config.width * 0.008,
                bW = (config.width * 0.5 - ( bS * (buts.length - 1) ) )/ buts.length,
                bH = config.height * 0.06,
                bX = config.width * 0.25 + bW/2,
                bY = config.height * 0.841 + bH/2;
                
            var _this = this;

            for ( var i = 0; i < buts.length; i++ ) {

                var but = new MyButton (this, buts[i].id,  bX + i * (bW + bS), bY, bW, bH, buts[i].value, 0xf3f3f3 );

                but.setScale (0.5);

                but.on('pointerover', function () {
                    this.change (0x9c9c9c);
                });
                but.on('pointerout',  function () {
                    this.reset();
                });
                but.on('pointerup',  function () {
                    this.reset()
                });
                
                but.on('pointerdown', function () {
                    this.change (0x9999ff);
                    
                    _this.playSound('clicka');

                    switch (this.id) {
                        case 'random' :
                            var rp = _this.randomPost();
                            _this.movePieces (rp);

                        break;
                        case 'preset' :
                            
                            _this.presetIndex += 1;
                            if ( _this.presetIndex > 5 ) {
                                _this.presetIndex = 0;
                            }
                            
                            var pp = _this.presetPost( _this.presetIndex );
                            _this.movePieces (pp);

                            //console.log ( _this.presetIndex );

                        break;
                        case 'ready' :
                            //..
                            clearInterval (_this.timer);
                            _this.startGame();

                        break;
                        case 'resign' :
                            //..
                            
                            if ( _this.isPrompted ) _this.clearPrompt();

                            setTimeout ( function () {                        
                                _this.showResignScreen();
                            }, 100);

                        break;
                        case 'proposedraw' :
                            //..
                            if ( _this.isPrompted ) _this.clearPrompt();

                            
                            setTimeout ( function () {     

                                if ( _this.turn == 'self' ) {
                                    _this.showDrawScreen();
                                } else {
                                    _this.showDrawWarning();
                                }                
                               
                            }, 100);
                            
                        break;
                        case 'showpieces' :
                            //..
                            if ( _this.isPrompted ) _this.clearPrompt();

                            setTimeout ( function () {                        
                                _this.showRevealScreen();
                            }, 100);
                            
                            
                        break;
                        
                        default :
                    }
                });
                    
                this.tweens.add ({

                    targets : but,
                    scaleX : 1,
                    scaleY : 1,
                    duration : 300,
                    ease : 'Elastic',
                    easeParams : [ 1, 0.5],

                });

                this.button.push ( but );
            }
        },
        createGameControls: function () {

            var cntrl = [ 'Show/Hide Eliminated Pieces', 'Set Music On/Off', 'Set Sound On/Off', 'Send Emoji', 'Leave Game' ];

            var cD = config.width * 0.04,
                cS = cD * 0.16,
                cW = ( cntrl.length * ( cD + cS ) ) - cD/2,
                cX = config.width - cW,
                cY = config.height * 0.963;

            var _this = this;

            for ( var i = 0; i < cntrl.length; i++ ) {

                var x = cX + i * (cD + cS);
                var cntrols = new Controls (this, 'cont' + i, x, cY, cD/2, cntrl[i], i, 0xcccccc );

                cntrols.on ('pointerover', function () {
                    this.change (0xdedede);
                    _this.controlsText.setText ( '· ' + this.txt  + ' ·');

                });
                cntrols.on ('pointerout', function () {
                    this.reset();
                    _this.controlsText.setText ('');
                });
                cntrols.on ('pointerup', function () {
                    this.reset();
                });
                cntrols.on ('pointerdown', function () {
                    this.change (0x9999ff);

                    switch (this.id) {
                        case 'cont0' :
                            //..
                            //if ( _this.gamePhase == 'prep' ) return;
                            _this.toggleElimPiecesScreen();
                            
                            this.toggle();
                            
                        break;
                        case 'cont1' :

                            if ( !_this.bgmusic.isPaused ) {
                                _this.bgmusic.pause();
                            }else {
                                _this.bgmusic.resume();
                            }
                            this.toggle();

                        break;
                        case 'cont2' :

                            _this.soundOff = !_this.soundOff;

                            this.toggle();

                        break;
                        case 'cont3' :

                            _this.isEmoji = !_this.isEmoji;

                            if ( _this.isEmoji ) {
                                _this.createEmojis();
                            }else {
                                _this.removeEmojis();
                            }
                            this.toggle();
                           
                        break;

                        case 'cont4' :

                            if ( _this.isPrompted ) _this.clearPrompt();

                            setTimeout ( function () {                        
                                _this.showLeaveScreen();
                            }, 100);
                            

                        break;
                        default :
                    }

                    _this.playSound('clicka');

                });

                this.controls.push ( cntrols );
            }
            
            var txtConfig = {
                color : '#300',
                fontSize : config.height * 0.02,
                fontFamily : 'Arial',
                fontStyle : 'bold'
            };

            var tx = config.width * 0.75,
                ty = config.height * 0.978;

            this.controlsText = this.add.text ( tx, ty, '', txtConfig ).setOrigin(1);

        },
        createGamePieces: function ( plyr, active=true ) {

            var gamePieces = [
                { rank : 1, rankName : 'General', count : 1 },
                { rank : 2, rankName : 'General', count : 1 },
                { rank : 3, rankName : 'General', count : 1 },
                { rank : 4, rankName : 'General', count : 1 },
                { rank : 5, rankName : 'General', count : 1 },
                { rank : 6, rankName : 'Colonel', count : 1 },
                { rank : 7, rankName : 'Lt. Colonel', count : 1 },
                { rank : 8, rankName : 'Major', count : 1 },
                { rank : 9, rankName : 'Captain', count : 1 },
                { rank : 10, rankName : '1st Lt.', count : 1 },
                { rank : 11, rankName : '2nd Lt.', count : 1 },
                { rank : 12, rankName : 'Sergeant', count : 1 },
                { rank : 13, rankName : 'Private', count : 6 },
                { rank : 15, rankName : 'Spy', count : 2 },
                { rank : 14, rankName : 'Flag', count : 1 }
            ];


            var _this = this;

            var rp = this.presetPost( plyr == 'self' ? this.presetIndex : Math.floor(Math.random()*6)  );

            var type = this.player[ plyr ].type;

            var counter = 0;

            for ( var i = 0; i< gamePieces.length ; i++) {

                for ( var j = 0; j < gamePieces[i].count; j++) {

                    var post = plyr == 'oppo' ? rp[counter]  : rp[counter] + 45;
                    
                    var grd = this.grid[ post ];
                
                    var gW = grd.width * 0.9,
                        gH = grd.height * 0.85;
                
                    var gp = new GamePiece (this, plyr +'_'+ counter, grd.x, grd.y, gW, gH, gamePieces[i].rank, gamePieces[i].rankName, type, post, plyr, active );
                    
                    gp.on ('pointerdown', function () {
                        
                        if ( _this.isPrompted ) return;

                        _this.removeBlinkers();

                        if ( !this.activated ) {

                            _this.removeActive();

                            _this.createBlinkers (this.post);
                            _this.activePiece = this.id;
                            this.activate();

                        }else {

                            _this.removeActive();
                            _this.playSound ('pick');

                            this.reset();
                        }
                        
                    });
                    
                    grd.residentPlayer = plyr;
                    grd.resident = gp.id;
                    
                    this.gamePiece [plyr+'_'+counter] = gp;
                    
                    counter += 1;
                }

                
            }

                //...
        },
        createBlinkers: function ( post, enabled=true ) {

            var _this = this;

            this.playSound ('pick');

            if ( this.gamePhase == 'prep' ){
            
                for ( var i =0; i < 27; i++ ) {
                    
                    var current = i + 45;
                    
                    var grd = this.grid[current];

                    if ( current != post ) {

                        var blink = new Blinker (this, 'blink_'+ current, grd.x, grd.y, grd.width, grd.height, current, enabled );

                        blink.on('pointerdown', function () {

                            if ( _this.grid[this.post].resident != '' ) {
                                _this.switchPieces ( this.post );
                            
                            }else {
                                _this.movePiece ( this.post );
                            }
                            
                            _this.removeBlinkers();

                        });

                        this.blinker.push (blink);
                    }
                }
            
            }else {

                //console.log ('turn', this.turn );
                
                var dir = this.getDirection(post, this.turn);
                
        
                for ( var i=0; i<dir.length; i++) {

                    var grd = this.grid [ dir[i].value ];

                    var blink = new Blinker ( this, 'blink_'+ i, grd.x, grd.y, grd.width, grd.height, dir[i].value, dir[i].dir, enabled );

                    blink.on('pointerdown', function () {
                        
                        _this.checkMove( this.post );
                            
                    });

                    this.blinker.push (blink);
                
                }

                //..    
            }

        },
        createEmojis: function () {

            var esize = config.width * 0.075;

            var emojiCount = 9, c = 3, r = Math.ceil ( emojiCount/c );

            var w = esize * c,
                h = esize * r,
                x = config.width - w,
                y = config.height * 0.924 - h;

            //this.rectBg = this.add.rectangle ( x + w/2, y + h/2, w, h, 0x0a0a0a, 0.5 ).setDepth(999);

            var _this = this;

            this.myEmojis = [];

            this.clickables = [];

            for ( var i = 0; i< emojiCount; i++ ) {

                var xp = Math.floor ( i/3 ), yp = i%3;

                var xpos = x + ( yp * esize ) + esize/2,
                    ypos = y + ( xp * esize ) + esize/2;

                var clicks = this.add.rectangle ( xpos, ypos, esize, esize, 0x0a0a0a, 0.8 ).setInteractive().setDepth (998).setData('count', i);

                clicks.on('pointerover', function () {
                    this.setFillStyle ( 0x9999ff, 1 );

                });
                clicks.on('pointerout', function () {
                   this.setFillStyle ( 0x0a0a0a, 0.8 );
                });
                clicks.on('pointerdown', function () {
                    
                    _this.sendEmoji ( this.getData('count') );

                    _this.playSound('message');

                    _this.isEmoji = false;

                    _this.removeEmojis();

                    _this.controls[3].toggle();

                    if ( _this.isSinglePlayer ) _this.autoRespond();

                });
                
                this.clickables.push ( clicks );

                var imgsize = esize * 0.9;

                var emoji = this.add.image ( xpos , ypos, 'thumbs', 30 + i ).setScale(imgsize/50).setDepth (998);

                this.myEmojis.push ( emoji );

                

            }

        },
        removeEmojis : function () {

            //this.rectBg.destroy();

            for ( var i = 0; i< this.myEmojis.length ; i++ ) {

                this.myEmojis[i].destroy();

                this.clickables[i].destroy();
            }

            this.myEmojis = [];

            this.clickables = [];

        },
        sendEmoji: function ( frame, plyr = 'self' ) {

            if ( this.isMessages ) this.removeSentEmojis();

            var max = 4;

            if ( this.messages.length >= max ) {
                this.messages.splice ( 0, 1 );
            }
            this.messages.push ( { 'frame' : frame, 'plyr' : plyr });

            var w = config.width * 0.23,
                h = config.height * 0.07,
                x = 0,
                y = config.height * 0.924 - ( h* this.messages.length);

            this.msgelements = [];

            for ( var i=0; i < this.messages.length; i++) {

                var xp = w/2, yp =  y + i*h + ( h/2 );

                var rect = this.add.rectangle ( xp, yp, w, h, 0x0a0a0a, 0.6 ).setDepth(998);

                this.msgelements.push ( rect );

                //players..

                var tx = w *0.1;

                var tmpPlyr = this.messages[i].plyr;

                var txtConfig = { color : tmpPlyr == 'self' ? '#0f0' : '#f99', fontSize : h * 0.3, fontFamily : 'Arial', fontStyle:'bold' };

                var text = this.add.text ( tx, yp, this.player[tmpPlyr].name + " :", txtConfig ).setDepth(998).setOrigin(0,0.5);

                this.msgelements.push ( text );


                //images...

                var tmpFrame = this.messages[i].frame;

                var imgsize = h * 0.9, sp = imgsize * 0.15;

                var emoji = this.add.image ( tx + text.width + (imgsize/2), yp, 'thumbs', 30 + tmpFrame ).setScale(imgsize/50).setDepth (998);

                this.msgelements.push ( emoji );

            }

            this.isMessages = true;

            var _this = this;

            clearTimeout ( this.timeDissolve );
            this.timeDissolve = setTimeout ( function () {
                console.log ('..')
                if ( _this.isMessages) 
                    _this.removeSentEmojis();
            }, 3000 );

        },
        removeSentEmojis : function () {
            
            clearTimeout ( this.timeDissolve );

            for ( var i in this.msgelements ) {
                this.msgelements[i].destroy();
            }
            this.msgelements = [];
            this.isMessages = false;

        },
        autoRespond: function () {

            var _this = this;
            setTimeout ( function () {
                _this.sendEmoji ( Math.floor ( Math.random() * 9 ), 'oppo' );
                _this.playSound ('message');
            }, 1000 );

        },
        checkMove :  function (post) {

            
            if ( this.grid[ post ].resident != '' &&  this.grid[post].residentPlayer != this.turn ) {
                                            
                this.checkClash( post);

            }else {
                
                this.movePiece ( post, this.turn );
            }
            
            this.removeBlinkers();

        },
        createAnim : function ( x, y, col = 0 ) {

        
            var cnt = 50;

            var pW = config.width * 0.005;

            var color = col == 0 ? 0xffffff : 0x000000;

            
            for ( var i=0; i<cnt; i++ ) {

                //var xp = x + Math.cos ( Math.PI/180 * (i*deg) ) * len,
                //    yp = y - Math.sin ( Math.PI/180 * (i*deg) ) * len; 
                var deg = Math.floor ( Math.random() * 360 );

                var rect = this.add.star (x, y, 5, pW, pW*2, color );

                var dest = Math.floor ( Math.random() * 100 ) + 50;

                this.tweens.add ({
                    targets : rect,
                    x : x + Math.cos ( Math.PI/180 * deg ) * dest,
                    y : y - Math.sin ( Math.PI/180 * deg ) * dest,

                    duration : Math.floor ( Math.random() * 300 ) + 500,
                    alpha : 0,
                    ease : 'Quad.easeOut',
                    onComplete : function () {
                        this.targets[0].destroy();
                    }
                });
                


            }

            //..

        },
        getDirection : function ( post , plyr = 'self' ) {

            var tmp = [];

            //console.log ( 'p', plyr );

            if ( ( post - 1 ) >= 0 && this.grid [post - 1].row == this.grid[post].row ){

                if ( this.grid[post-1].resident == '' ||  this.grid[post-1].residentPlayer != plyr )
                    tmp.push ( { dir : 'left' , value : post - 1 } );

            }
            if ( ( post + 1 ) < 72 && this.grid [post + 1].row == this.grid[post].row ){
                if ( this.grid[post+1].resident == '' ||  this.grid[post+1].residentPlayer != plyr )
                    tmp.push ( { dir : 'right' , value : post + 1 } );

            }
            if ( ( post - 9 ) >= 0 && this.grid [post - 9].col == this.grid[post].col ){
                if ( this.grid[post-9].resident == '' ||  this.grid[post-9].residentPlayer != plyr )
                    tmp.push ( { dir : 'up' , value : post - 9 } );
                
            }
            if ( ( post + 9 ) < 72 && this.grid [post + 9].col == this.grid[post].col ){
                if ( this.grid[post+9].resident == '' ||  this.grid[post+9].residentPlayer != plyr )
                    tmp.push ( { dir : 'down' , value : post + 9 } );
                
            }

            return tmp;
        },
        randomPost : function () {

            var tmp = [];
            for ( var i=0; i<27; i++ ) {
                tmp.push (i);
            }

            var fin = [];
            while ( fin.length < 21 ) {

                var indx = Math.floor ( Math.random() * tmp.length );

                fin.push ( tmp[indx] );

                tmp.splice ( indx, 1 );
            }

            return fin;
        },
        presetPost : function ( pIndex ) {

            var presets = [ 
                [0, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                [3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                [0, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 26],
                [0, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25],
                [2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25]
            ];
            
            var tmp = presets [ pIndex ];

            var fin = [];

            while (tmp.length > 0 ) {

                var indx = Math.floor ( Math.random() * tmp.length );

                fin.push ( tmp[indx] );

                tmp.splice(indx, 1);
            }
            
            return fin;

        },
        movePieces : function ( postArr ) {

            var counter = 0;

            for ( var j=0; j<27; j++) {
                this.grid[ j + 45 ].residentPlayer = '';
                this.grid[ j + 45 ].resident = '';
            }

            for ( var i in this.gamePiece ) {
                if ( this.gamePiece[i].plyr == 'self' ) {

                    var gp = this.gamePiece[i];
                    
                    gp.post = postArr[counter] + 45;

                    this.grid[postArr[counter] + 45].residentPlayer = 'self';
                    this.grid[postArr[counter] + 45].resident = gp.id;
                    
                    this.tweens.add ({
                        targets : this.gamePiece[i],
                        x : this.grid [ postArr [counter] + 45].x,
                        y : this.grid [ postArr [counter] + 45].y,
                        duration : 300,
                        ease : 'Power2',
                        
                    });

                    counter++;
                }
            }

            this.removeActive();
            this.removeBlinkers();

        },
        movePiece : function ( post, plyr='self' ) {

            this.playSound('move');

            var grd = this.grid[post];

            var piece = this.gamePiece [ this.activePiece ];

            var p1 = {
                x : piece.x, y : piece.y,
                post : piece.post,
            }

            this.tweens.add ({
                targets : piece,
                x : this.grid[post].x, 
                y : this.grid[post].y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1, 0.5]
            });

            piece.post = post;
            piece.reset();

            this.grid[p1.post].residentPlayer = '';
            this.grid[p1.post].resident = '';

            this.grid[post].residentPlayer = plyr;
            this.grid[post].resident = piece.id;            

            this.removeActive();

            var win = false;

            if ( this.gamePhase == 'proper' ) {
                
                if ( piece.rnk == 14 && piece.origin == 'bot' && grd.row == 0  || piece.rnk == 14 && piece.origin == 'top' && grd.row == 7  ) {
                    
                    var sorrounded = this.checkNearby ( post, piece.plyr );

                    if ( sorrounded ) {
                        this.isWinning = this.turn;
                    }else {
                        
                        this.endGame ( this.turn );

                        this.playSound('home');

                        win = true;
                    }
                }

                if ( !win ) this.switchTurn();

            } 
            

        },
        switchPieces: function (post) {
            
            this.playSound('move');

            var p1 = {
                x : this.gamePiece [ this.activePiece ].x,
                y : this.gamePiece [ this.activePiece ].y,
                id : this.gamePiece [this.activePiece].id,
                post : this.gamePiece [ this.activePiece ].post,
            }

            var resident = this.grid[post].resident;
            
            var p2 = {
                x : this.gamePiece [ resident ].x,
                y : this.gamePiece [ resident ].y,
                id : resident,
                post : post,
            }

            this.tweens.add ({
                targets : this.gamePiece[resident],
                x : p1.x, 
                y : p1.y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1.1, 0.5]

            });
            this.gamePiece[resident].post = p1.post;

            this.tweens.add ({
                targets : this.gamePiece[ this.activePiece ],
                x : p2.x, 
                y : p2.y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1.1, 0.5]
                
            });
            this.gamePiece[this.activePiece].post = p2.post;
            
            this.grid[p1.post].resident = p2.id;
            this.grid[post].resident = p1.id;

            this.removeActive();

        },
        checkNearby: function (post, plyr) {

            if ( ( post-1 ) >= 0 && this.grid [post-1].row == this.grid[post].row && this.grid [post-1].resident != '' && this.grid [post-1].residentPlayer != plyr ){
                return true;
            }
            if ( ( post+1 ) < 72 && this.grid [post+1].row == this.grid[post].row && this.grid [post+1].resident != '' && this.grid [post+1].residentPlayer != plyr ){
                return true;
            }
            if ( ( post-9 ) >= 0 && this.grid [post-9].col == this.grid[post].col && this.grid [post-9].resident != '' && this.grid [post-9].residentPlayer != plyr ){
                return true;
            }
            if ( ( post+9 ) < 72 && this.grid [post+9].col == this.grid[post].col && this.grid [post+9].resident != '' && this.grid [post+9].residentPlayer != plyr ){
                return true;
            }
            return false;

        },
        removeActive: function () {

            if ( this.activePiece != '') {
                this.gamePiece[this.activePiece].reset();
            }
            this.activePiece = '';
            
        },
        removeBlinkers: function ( destroy=true) {

            if ( destroy ) {

                for ( var i in this.blinker ){

                    this.blinker[i].destroy();
                }
                this.blinker = [];

            }else {

                for ( var i in this.blinker ){
                    this.blinker[i].disableInteractive();
                }
            }

            //..
        },
        removeButtons: function () {

            for ( var i in this.button ){
                //this.button[i].destroy();
                this.tweens.add ({
                    targets : this.button[i],
                    //y : config.height + this.button[i].height,
                    alpha : 0,
                    scaleX : 0.5,
                    scaleY : 0.5,
                    duration : 300,
                    ease : 'Sine.easeInOut',
                    onComplete : function () {
                        this.targets[0].destroy();
                    }
                });
            }
            this.button = [];
        },   
        enabledPieces: function (plyr, enable=true ) {

            for ( var i in this.gamePiece ) {
            
                if ( this.gamePiece[i].plyr == plyr  && !this.gamePiece[i].isDestroyed ){
                    if ( !enable ) {
                        this.gamePiece[i].disableInteractive();
                    }else {
                        this.gamePiece[i].setInteractive();
                    }
                }

            }

        },
        startPreparations: function () {

            if ( this.isTimed  ) {

                var _this = this;

                var timeCount = 0;

                var max = this.maxPrepTime;
                
                this.plyrInd ['self'].setTimer ( max, '· Preparation' );
                    
                clearInterval ( this.timer );

                this.timer = setInterval (function () {
                    timeCount++;
                    _this.plyrInd ['self'].tick ( max - timeCount );
                    
                    if ( timeCount >= max) {
                        clearInterval( _this.timer );
                        
                        _this.startGame();

                        _this.playSound ('warp');
                    }else {

                        _this.playSound ('tick');
                    }
                }, 1000);

            }else {

                this.plyrInd ['self'].timerOff ('· Preparation')

            }

        },
        startGame: function () {

            var _this = this;

            this.removeActive();

            this.removeBlinkers();

            this.removeButtons();

            this.enabledPieces ('self', false );

            this.plyrInd['self'].clearTimer();

            this.gamePhase = 'proper';

            this.turn = this.player['self'].type == 0 ? 'self' : 'oppo';

            setTimeout ( function () {
                
                _this.createGamePieces ( 'oppo', false );
                _this.showCommenceScreen();

            }, 500);


        },
        switchTurn : function () {
    
            this.turn = this.turn == 'self' ? 'oppo' : 'self';

            if ( this.isWinning != '' && this.isWinning == this.turn ) {

                this.playSound('home');

                this.endGame (this.turn);

            }else {
                
                this.makeTurn ();
            }
            
        },
        makeTurn :  function () {
            
            var _this = this;

            var plyr = this.player[this.turn];

            this.startBlitzTimer ();
            
            this.enabledPieces ('self', this.turn == 'self' && !this.player['self'].isAI );

            this.enabledPieces ('oppo', this.turn == 'oppo' && !this.player['oppo'].isAI );
            
            if ( this.player[this.turn].isAI == true ) {

                setTimeout(function () {
                    _this.autoPick();
                }, 500);

            }

        },
        startBlitzTimer: function () {

            var opp = this.turn == 'self' ? 'oppo' : 'self';

            if ( this.isTimed ) {

                var _this = this;

                this.plyrInd[this.turn].setTimer ( this.maxBlitzTime, '· Your Turn');
                this.plyrInd[opp].clearTimer();
                
                clearInterval (this.timer);

                _this.timerCount = 0;

                this.timer = setInterval (function () {
                    
                    _this.timerCount += 1;
                    
                    _this.plyrInd[ _this.turn ].tick ( _this.maxBlitzTime - _this.timerCount );

                    if ( _this.timerCount  >=  _this.maxBlitzTime ) {

                        clearInterval ( _this.timer );
                        _this.removeActive();
                        _this.removeBlinkers(false);
                        _this.endGame( opp );

                        _this.playSound ('alarm');

                    }else {

                        _this.playSound ('tick');
                         
                    }

                }, 1000);

            }else {

                this.plyrInd[this.turn].timerOff ('· Your Turn');
                this.plyrInd[opp].clearTimer();

            }

        },
        getWinner : function ( rankA, rankB ) {

            if ( rankA == 14 && rankB != 14 ) {  // A = Flag, B = Any except flag
                return 2; 
            }
            if ( rankB == 14 && rankA != 14 ) {  // B = Flag, A = Any except flag
                return 1; 
            }
            if ( rankA == 14 && rankB == 14 ) {  // A = Flag attacks B = Flag  -> winner : A
                return 1; 
            }
            if ( rankB == 14 && rankA == 14 ) {  // B = Flag attacks A = Flag  -> winner : B
                return 2; 
            }
            if ( rankA == 15 && rankB == 15 ) { // A = Spy, B = Spy -> no winner
                return 0;
            }
            if ( rankA == 15 && rankB != 13 ) { // A = Spy, B != Private -> winner : A
                return 1; 
            }
            if ( rankB == 15 && rankA != 13 ) { // B = Spy, A != Private -> winner : B
                return 2; 
            }
            if ( rankA == 15 && rankB == 13 ) { // A = Spy, B == Private -> winner : B
                return 2; 
            }
            if ( rankB == 15 && rankA == 13 ) { // B = Spy, A == Private -> winner : A
                return 1; 
            }
            if ( rankA < rankB ) {
                return 1;
            }
            if ( rankB < rankA ) {
                return 2;
            }
            if ( rankB == rankA ) {
                return 0;
            }

        },
        checkClash ( post ) {

            var grd = this.grid[post];

            var attacker = this.gamePiece[this.activePiece];

            var resident = this.gamePiece [ grd.resident ];
            
            var clashWinner = this.getWinner ( attacker.rnk, resident.rnk );

        
            var p1 = {
                x : resident.x, y : resident.y,
                id : resident.id,
                post : resident.post,
            };

            this.tweens.add ({
                targets : attacker,
                x : grd.x, 
                y : grd.y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1, 0.5]
            });

            //console.log ( 'winner', clashWinner );
            var win = false;

            if ( clashWinner == 1 ) {

                this.grid [ attacker.post ].resident = '';
                this.grid [ attacker.post ].residentPlayer = '';

                this.grid [ post ].resident = attacker.id;
                this.grid [ post ].residentPlayer = this.turn;

                attacker.post = post;

                resident.isDestroyed = true;
                resident.setVisible(false);

                this.removeActive();

                this.createAnim ( grd.x, grd.y, resident.type );

                if ( resident.rnk == 14 ) {
                    
                    this.endGame ( attacker.plyr );

                    win = true;

                }

                this.playSound ( resident.plyr == 'self' ? 'clashlost' : 'clashwon', { volume: 0.5} );

            }else if ( clashWinner == 2 ) {

                this.grid [ attacker.post ].resident = '';
                this.grid [ attacker.post ].residentPlayer = '';

                attacker.isDestroyed = true;
                attacker.setVisible(false);

                this.tweens.add ({
                    targets : resident,
                    rotation : Math.PI/180 * 10, 
                    duration : 100,
                    yoyo : 'true',
                    ease : 'Elastic',
                    easeParams : [1.2, 0.5]
                });

                this.activePiece = '';

                this.createAnim ( grd.x, grd.y, attacker.type );
                

                if ( attacker.rnk == 14 ) {
                    this.endGame ( resident.plyr );
                    win = true;
                }

                this.playSound ( attacker.plyr == 'self' ? 'clashlost' : 'clashwon');


            }else {

                attacker.isDestroyed = true;
                resident.isDestroyed = true;
                
                attacker.setVisible(false);
                resident.setVisible(false);
                
                this.grid [ attacker.post ].resident = '';
                this.grid [ attacker.post ].residentPlayer = '';

                this.grid [ resident.post ].resident = '';
                this.grid [ resident.post ].residentPlayer = '';

                delete this.gamePiece[this.activePiece];;
                delete this.gamePiece[ this.grid[ post ].resident ];

                this.createAnim ( grd.x, grd.y, 0 );
                this.createAnim ( grd.x, grd.y, 1 );

                this.activePiece = '';

                this.playSound ('clashdraw');

            }
            
            if ( !win ) this.switchTurn();

        },
        endGame: function ( winner ) {

            clearInterval (this.timer);

            this.enabledPieces ('self', false );
            this.enabledPieces ('oppo', false );
    
            this.removeButtons();

            this.player[winner].wins += 1;
            
            this.gamePhase = 'end';

            var _this = this;
            
            if ( this.isPrompted ) this.clearPrompt();

            setTimeout ( function () {

                _this.plyrInd[winner].updateWins (_this.player[winner].wins);

                _this.revealPieces();

                _this.showEndScreen( winner=='self' ? 'Congrats! You win.' : 'Sorry! You lose.' );

            }, 500 );

        },
        showCommenceScreen :  function () {
            
            var cW = config.width * 0.25,
                cH = config.height * 0.15,
                cX = ( config.width - cW )/2,
                cY = this.fieldY + ( ( this.fieldHeight - cH )/2 );

            this.commenceGraphics = this.add.graphics();

            this.commenceGraphics.fillStyle (0x000000, 0.5);
            this.commenceGraphics.lineStyle (2, 0x9a9a9a);

            this.commenceGraphics.fillRoundedRect ( cX, cY, cW, cH, cH * 0.05 );
            this.commenceGraphics.strokeRoundedRect ( cX, cY, cW, cH, cH * 0.05 );

            var tX = cX + cW/2,
                tY = cY + cH/2;

            var counter = 0, max = 3;

            var _this = this;

            this.miniCirc = this.add.star ( tX, tY, 8, (cH*0.5)/2, cH*0.5,  0xccff99, 0.5 );

            this.tweens.add ({
                targets : this.miniCirc,
                scaleX : 0.2,
                scaleY : 0.2,
                rotation : 90,
                yoyo : true,
                duration : 500,
                repeat : 2
            });

            var txtConfig = {
                color : '#f5f5f5',
                fontSize : cH * 0.7,
                fontFamily : 'Arial',
                fontStyle : 'bold'
            };

            this.commenceText = this.add.text ( tX, tY, max, txtConfig).setOrigin(0.5);
            this.commenceText.setStroke('#3a3a3a', 5);

            this.playSound ('beep');

            clearInterval (this.timer);

            this.timer = setInterval( function () {

                counter++;
                
                //_this.commenceText.setText ( 'Game Commencing in.. '+ ( max - counter) );

                _this.commenceText.setText ( max - counter );
            
                if ( counter >= max ) {
                
                    clearInterval (_this.timer);

                    _this.commenceText.destroy();
                    _this.commenceGraphics.destroy();
                    _this.miniCirc.destroy();

                    _this.createButtons (true);
                    _this.makeTurn ();
                            
                    _this.playSound ('bell');

                }else {

                    _this.playSound ('beep');
                }

            }, 1000 );

        },
        showEndScreen : function ( txt='Sample text', caption='' ) {

            this.isPrompted = true;
            
            this.playSound ('alternate');

            this.endGraphic = this.add.graphics();

            var gW = config.width * 0.6,
                gH = config.height * 0.3,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (2, 0xf5f5f5 );

            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
            //graphics.strokeRoundedRect ( gX, gY, gW, gH, gH * 0.05 );

            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.08,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };
            
            this.endtext = this.add.text ( gX + gW/2, gY + gH * 0.35, txt, txtConfig).setOrigin(0.5)

            var txtConfig2 = {
                color : '#ff0',
                fontSize : gW * 0.025,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };

            //this.endCaption = this.add.text ( gX + gW/2, gY + gH * 0.51, caption, txtConfig2).setOrigin(0.5)

            var buts = ['Rematch'];

            var bW = gW * 0.35,
                bH = gH * 0.2,
                bS = bW * 0.05,
                bT = (buts.length * bW) + ( ( buts.length - 1) * bS ),
                bX =  ( gW - bT )/2 + gX + bW/2,
                bY = gY + gH * 0.75;

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede );

                btn.on ('pointerdown', function() {
                    this.change (0x9999ff);

                    _this.playSound('clicka');

                    switch ( this.id ) {
                        case 'but0' : 
                            _this.resetGame();
                        break;
                        case 'but1' : 
                            //..
                            _this.leaveGame();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change (0x9a9a9a);
                });
                btn.on ('pointerup', function() {
                    this.reset();
                });
                btn.on ('pointerout', function() {
                    this.reset();
                });

                this.buttonPanel.push (btn);
            }

        },
        showResignScreen : function () {

            if ( this.isPrompted ) this.clearPrompt();

            this.isPrompted = true;

            this.endGraphic = this.add.graphics();

            var gW = config.width * 0.6,
                gH = config.height * 0.3,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (2, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
            

            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.04,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };        
            this.endtext = this.add.text ( gX + gW/2, gY + gH * 0.35, 'Are you sure you want to resign?', txtConfig).setOrigin(0.5);

            var buts = [ 'Confirm', 'Cancel'];

            var bW = gW * 0.3,
                bH = gH * 0.2,
                bS = bW * 0.05,
                bT = (buts.length * bW) + ( ( buts.length - 1) * bS ),
                bX =  ( gW - bT )/2 + gX + bW/2,
                bY = gY + gH * 0.75;

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede );

                btn.on ('pointerdown', function() {
                    this.change (0x9999ff);

                    _this.playSound('clicka');
                    
                    switch ( this.id ) {
                        case 'but0' : 
                            console.log ('yes');
                            _this.endGame ('oppo');
                            _this.clearPrompt();
                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change (0x9a9a9a);
                });
                btn.on ('pointerup', function() {
                    this.reset();
                });
                btn.on ('pointerout', function() {
                    this.reset();
                });

                this.buttonPanel.push (btn);
            }

        },
        showRevealScreen : function () {

            if ( this.isPrompted ) this.clearPrompt();

            this.isPrompted = true;

            this.endGraphic = this.add.graphics();

            var gW = config.width * 0.6,
                gH = config.height * 0.3,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (2, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
            
            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.04,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };        
            this.endtext = this.add.text ( gX + gW/2, gY + gH * 0.35, 'Reveal your pieces to the opponent?', txtConfig).setOrigin(0.5);

            var buts = ['Confirm', 'Cancel'];

            var bW = gW * 0.3,
                bH = gH * 0.2,
                bS = bW * 0.05,
                bT = (buts.length * bW) + ( ( buts.length - 1) * bS ),
                bX =  ( gW - bT )/2 + gX + bW/2,
                bY = gY + gH * 0.75;

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede );

                btn.on ('pointerdown', function() {
                    this.change (0x9999ff);

                    _this.playSound('clicka');

                    switch ( this.id ) {
                        case 'but0' : 

                            _this.clearPrompt();
                            
                            _this.button[2].disabled();
                            _this.button[2].removeInteractive();
        
                            setTimeout ( function () {
                                _this.playSound('bleep');
                                _this.plyrInd['self'].updateStatus();
                            }, 300); 

                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change (0x9a9a9a);
                });
                btn.on ('pointerup', function() {
                    this.reset();
                });
                btn.on ('pointerout', function() {
                    this.reset();
                });

                this.buttonPanel.push (btn);
            }

        },
        showDrawScreen : function () {

            if ( this.isPrompted ) this.clearPrompt();

            this.isPrompted = true;

            this.endGraphic = this.add.graphics();

            var gW = config.width * 0.6,
                gH = config.height * 0.3,
                gX = ( config.width - gW )/2,
                gY = config.height * 0.32;

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (2, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
            
            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.04,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };        
            this.endtext = this.add.text ( gX + gW/2, gY + gH * 0.35, 'Do you propose a draw?', txtConfig).setOrigin(0.5);

            var buts = ['Confirm', 'Cancel'];

            var bW = gW * 0.3,
                bH = gH * 0.2,
                bS = bW * 0.05,
                bT = (buts.length * bW) + ( ( buts.length - 1) * bS ),
                bX =  ( gW - bT )/2 + gX + bW/2,
                bY = gY + gH * 0.75;

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede );

                btn.on ('pointerdown', function() {
                    this.change (0x9999ff);

                    _this.playSound('clicka');

                    switch ( this.id ) {
                        case 'but0' : 

                            _this.clearPrompt();

                            _this.showWaitResponse();
                            
                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change (0x9a9a9a);
                });
                btn.on ('pointerup', function() {
                    this.reset();
                });
                btn.on ('pointerout', function() {
                    this.reset();
                });

                this.buttonPanel.push (btn);
            }

        },
        showDrawWarning : function () {

            this.isPrompted = true;

            var gW = config.width * 0.6,
                gH = config.height * 0.12,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic = this.add.graphics();

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (1, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
                
            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.035,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };       

            this.endtext = this.add.text ( gX + gW/2, gY + gH/2, 'You can only propose a draw on your turn', txtConfig).setOrigin(0.5);

            clearTimeout ( this.timeDissolveWarning );
            var _this = this;
            this.timeDissolveWarning = setTimeout ( function () {
                _this.clearPrompt();
            }, 1000 );

        },
        showWaitResponse : function () {

            clearInterval(this.timer);

            this.isPrompted = true;

            var gW = config.width * 0.6,
                gH = config.height * 0.12,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic = this.add.graphics();

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (1, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
                
            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.035,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };       

            this.endtext = this.add.text ( gX + gW/2, gY + gH/2, 'Waiting for response...', txtConfig).setOrigin(0.5);

            clearTimeout ( this.timeDissolveWarning );
            var _this = this;
            this.timeDissolveWarning = setTimeout ( function () {
                _this.clearPrompt();

            }, 5000 );

        },
        showLeaveScreen : function () {

            if ( this.isPrompted ) this.clearPrompt();

            this.isPrompted = true;

            this.endGraphic = this.add.graphics();

            var gW = config.width * 0.6,
                gH = config.height * 0.3,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            this.endGraphic.fillStyle (0x3a3a3a, 0.8 );
            this.endGraphic.lineStyle (2, 0xf5f5f5 );
            this.endGraphic.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );
            
            var txtConfig = {
                color : '#fff',
                fontSize : gW * 0.04,
                fontFamily : "Verdana",
                fontStyle : 'bold'
            };        
            this.endtext = this.add.text ( gX + gW/2, gY + gH * 0.35, 'Are you sure you want to leave?', txtConfig).setOrigin(0.5);

            var buts = ['Confirm', 'Cancel'];

            var bW = gW * 0.3,
                bH = gH * 0.2,
                bS = bW * 0.05,
                bT = (buts.length * bW) + ( ( buts.length - 1) * bS ),
                bX =  ( gW - bT )/2 + gX + bW/2,
                bY = gY + gH * 0.75;

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede );

                btn.on ('pointerdown', function() {
                    this.change (0x9999ff);

                    _this.playSound('clicka');

                    switch ( this.id ) {
                        case 'but0' : 

                            _this.clearPrompt();
                            _this.leaveGame();

                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change (0x9a9a9a);
                });
                btn.on ('pointerup', function() {
                    this.reset();
                });
                btn.on ('pointerout', function() {
                    this.reset();
                });

                this.buttonPanel.push (btn);
            }

        },
        resetGame : function () {

            this.clearPrompt();
            this.removeGamePieces();
            this.removeBlinkers();

            this.plyrInd['self'].resetStatus();
            this.plyrInd['oppo'].resetStatus();

            //change player's type..
            for ( var i in this.player ) {
                this.player[i].type = this.player[i].type == 0 ? 1 : 0;
            }

            //reset grid..
            for ( var i in this.grid ) {
                this.grid[i].resident = '';
                this.grid[i].residentPlayer = '';
            }

            this.gamePhase = 'prep';
            this.isWinning = '';
            this.activePiece = '';

            var _this = this;

            setTimeout ( function () {
                _this.createGamePieces('self');
                _this.startPreparations()
                _this.createButtons();
            }, 500);
            
        },
        clearPrompt: function () {

            this.endGraphic.destroy();
            this.endtext.destroy();

            this.isPrompted = false;

            for ( var i in this.buttonPanel ) {
                this.buttonPanel[i].destroy();
            }

        },
        removeGamePieces : function () {
            for ( var i in this.gamePiece ) {
                this.gamePiece[i].destroy()
            }
            this.gamePiece = {};
        },
        revealPieces : function () {

            for ( var i in this.gamePiece ) {
                if ( !this.gamePiece[i].isOpen ) {
                    this.gamePiece[i].flip();
                }
            }
        },
        toggleElimPiecesScreen : function () {


            /* if ( this.isEmoji ) {
               
                this.removeEmojis();

                this.isEmoji = false;
            } */

            this.elimScreenShown = !this.elimScreenShown;
            
            if ( this.elimScreenShown ) {
                
                var cW = config.width,
                    cH = config.height * 0.824,
                    cX = config.width/2,
                    cY = config.height * 0.512;

                this.elimScreen = this.add.rectangle( cX - cW * 0.6, cY, cW, cH, 0x0a0a0a, 0.9 );
                this.elimScreen.setInteractive().setDepth (999);

                this.tweens.add ({
                    targets : this.elimScreen,
                    x : cX,
                    duration : 300,
                    ease : 'Power2'
                });


                this.circs = [];

                var size = config.width * 0.008,
                    spacing = config.height * 0.03;

                for ( var j=0; j<5; j++) {

                    var circ = this.add.ellipse( config.width/2 - (cW * 0.8), (config.height * 0.25) + j * ( size + spacing ), size, size, 0xc9c9c9 );
                    
                    circ.setDepth ( 1000 );

                    this.tweens.add ({
                        targets : circ,
                        x : config.width/2,
                        duration : 300,
                        ease : 'Power2'
                    });

                    this.circs.push ( circ );
                }

                
                var configtxt = {
                    color : '#fff',
                    fontSize : config.height * 0.03,
                    fontFamily : 'Arial',
                    fontStyle : 'bold'
                };

                this.texta = this.add.text( config.width/2 - (cW*0.8), config.height * 0.15, '❂ Eliminated Pieces', configtxt).setOrigin(0.5).setDepth(1000);

                this.tweens.add ({
                    targets : this.texta,
                    x : config.width/2,
                    duration : 300,
                    ease : 'Power2'
                });
                

                var selfX = config.width * 0.09,
                    selfY = config.height * 0.25,
                    oppoX = config.width * 0.59,
                    oppoY = selfY;

                var counter = 0, counterb = 0;

                for ( var i in this.gamePiece ) {
                    
                    var gp = this.gamePiece[i];

                    if ( gp.plyr == 'self' && gp.isDestroyed ) {

                        var xp = counter % 4, 
                            yp = Math.floor ( counter/4 );

                        gp.x =  selfX + xp * ( gp.width + (gp.width * 0.1) ) - (cW*0.8);
                        gp.y =  selfY + yp * ( gp.height + (gp.height * 0.15) );

                        gp.setDepth ( 1000 );
                        gp.reset();
                        gp.setVisible ( true );
                        
                        if ( !gp.isOpen ) gp.flip();
                        
                        this.tweens.add ({
                            targets : gp,
                            x : selfX + xp * ( gp.width + (gp.width * 0.1) ),
                            duration : 300,
                            ease : 'Power2'
                        });

                        
                        counter ++;
                        
                    }

                    if ( gp.plyr == 'oppo' && gp.isDestroyed ) {


                        var xpa = counterb % 4, 
                            ypa = Math.floor ( counterb/4 );

                        gp.x =  oppoX + xpa * ( gp.width + (gp.width * 0.1) ) - (cW* 0.8),
                        gp.y =  oppoY + ypa * ( gp.height + (gp.height * 0.15) );

                        gp.setDepth ( 1000 );
                        gp.reset();
                        gp.setVisible ( true );

                        this.tweens.add ({
                            targets : gp,
                            x : oppoX + xpa * ( gp.width + (gp.width * 0.1) ),
                            duration : 300,
                            ease : 'Power2'
                        });
                        
                        
                        //if ( !gp.isOpen ) gp.flip();
                        
                        counterb ++;
                        
                    }
                    
                } 

            }else {

                //this.elimScreen.clear();
                this.elimScreen.destroy();
                this.texta.destroy();

                for ( var i in this.gamePiece ) {
                    if ( this.gamePiece[i].isDestroyed ) {
                        this.gamePiece[i].setVisible (false);
                    }
                }

                for ( var j=0; j<this.circs.length; j++ ) {
                
                        this.circs[j].destroy();
                    
                }

                
                //todo..
            }
            

        },
        autoPick : function () {

            var plyr = this.turn;

            var tmp = [];

            var dest = plyr == 'self' ? 'up' : 'down';

            for ( var i in this.gamePiece ) {

                if ( this.gamePiece[i].plyr == plyr && !this.gamePiece[i].isDestroyed ) {

                    var dir = this.getDirection( this.gamePiece[i].post, plyr );

                    for ( var j=0; j<dir.length; j++) {

                        if ( dir[j].dir == dest ) {
                            tmp.push ( this.gamePiece[i].id );       
                        }

                    }

                    if ( dir.length > 0 ) {    
                        //tmp.push ( this.gamePiece[i].id );
                    }

                }
            }

            //...

            var randInx = Math.floor ( Math.random() * tmp.length );

            var gp = this.gamePiece[ tmp[randInx] ]

            this.activePiece = gp.id;

            this.createBlinkers ( gp.post, false );

            var fin_dir = this.getDirection (gp.post, plyr);

            //var fin_rand = Math.floor ( Math.random() * fin_dir.length );

            var fin_post = 0;

            for ( var i=0; i<fin_dir.length; i++) {
                if ( fin_dir[i].dir == dest ) {
                    fin_post = fin_dir[i].value;
                }
            }


            var _this = this;

            setTimeout ( function () {
                
                _this.checkMove( fin_post );
            
            }, 1000 );

            //return tmp[randInx];

        },
        playSound: function ( key ) {

            if ( !this.soundOff ) {
                
                if ( key == 'tick') {
                    this.tick.play();
                }else {
                    this.music.play (key);
                }
            }

        },
        leaveGame : function () {
            
            clearInterval ( this.timer );
            clearTimeout ( this.timeDissolve );
            clearTimeout ( this.timeDissolveWarning );

            this.bgmusic.stop();

            this.scene.start('Intro');
           

        },
        
    });

    //..GamePiece...
    var GamePiece =  new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function GamePiece ( scene, id, x, y, width, height, rnk, rnkName, type, post, plyr, active=false )
        {

            Phaser.GameObjects.Container.call(this, scene)

            this.setPosition(x, y).setSize(width, height);

            if ( active ) this.setInteractive();

            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.isClicked = false;
            this.type = type;
            this.plyr = plyr;
            this.rnk = rnk;
            this.rnkName = rnkName;
            this.post = post;
            this.activated = false;
            this.origin = plyr == 'self' ? 'bot' : 'top';
            this.isDestroyed = false;

            this.isOpen = plyr == 'self' ? true : false;

            //this.isOpen = true;

            this.bgColor = type == 0 ? 0xffffff : 0x000000;
            
            this.shape = scene.add.graphics ( { fillStyle: { color: this.bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            this.shape.fillRoundedRect ( -width/2, -height/2, width, height, height * 0.1);
            this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, height * 0.1);

            var txtConfig = { 
                fontFamily: 'Trebuchet MS', 
                //fontStyle : 'bold',
                fontSize: Math.floor(height * 0.21), 
                color: type == 0 ? '#000' : '#fff' 
            };

            var top = -height/2,
                left = -width/2;

            var imgSize = width * 0.5;

            var indx = type == 0 ? 15 : 16;

            var frame = this.isOpen ? rnk -1 : indx;
                
            var txtValue = this.isOpen ? rnkName : '···';

            this.image = scene.add.image ( 0, top + height * 0.4, 'thumbs', frame ).setScale ( imgSize/50 )

            this.txt = scene.add.text ( 0, top + height * 0.8, txtValue, txtConfig ).setOrigin(0.5);

            
            //add to container...
            this.add ([this.shape, this.image, this.txt]);

            scene.children.add ( this );
            
        },

        activate : function () {

            this.shape.clear();
            this.shape.fillStyle( this.type == 0 ? 0xd5d5d5 : 0x2a2a2a, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);

            this.activated = true;
        },
        reset : function () {

            this.shape.clear();
            this.shape.fillStyle( this.type == 0 ? 0xffffff : 0x000000, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);

            this.activated = false;

        },
        
        flip: function () {

            this.image.setFrame (this.rnk - 1);
            this.txt.setText ( this.rnkName );
        }
        
    });

    //..GamePiece...
    var Blinker =  new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function Blinker ( scene, id, x, y, width, height, post, dir='', enabled=true  )
        {

            Phaser.GameObjects.Container.call(this, scene)

            this.setPosition(x, y).setSize(width, height);

            if ( enabled ) this.setInteractive();

            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.post = post;
            this.dir = dir;
            
            this.shape = scene.add.graphics ( { fillStyle: { color: 0x00cc00, alpha: 0.4 }, lineStyle: { width : 2, color : 0xdedede } } );
            this.shape.fillRect ( -width/2, -height/2, width, height);
            this.shape.strokeRect ( -width/2, -height/2, width, height);
            
            var imgFrame = 0;

            if ( dir == 'up' ) {
                imgFrame = 20;
            }else if ( dir == 'down') {
                imgFrame  = 21;
            }else if ( dir == 'right') {
                imgFrame = 22;
            }else if ( dir == 'left' ) {
                imgFrame = 23;
            }else {
                imgFrame = 24
            }
            
            this.image = scene.add.image ( 0, 0, 'thumbs', imgFrame ).setScale( width*0.4/50).setAlpha(0);
            
            scene.tweens.add ({
                targets : this.image,
                alpha : 1,
                duration : 400,
                yoyo : true,
                repeat : -1,
                ease : 'Sine.easeIn'
            });

            //add to container...
            this.add ([this.shape, this.image]);

            scene.children.add ( this );

            
            
        },
        
    });

    //..Button...
    var MyButton =  new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function MyButton ( scene, id, x, y, width, height, text, bgColor = 0x3c3c3c  )
        {

            Phaser.GameObjects.Container.call(this, scene)

            this.setPosition(x, y).setSize(width, height).setInteractive();

            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.isActive = false;
            this.isClicked = false;
            this.bgColor = bgColor;
            
            this.roundCorners = this.height *0.2;

            this.shape = scene.add.graphics ( { fillStyle: { color: bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            this.shape.fillRoundedRect ( -width/2, -height/2, width, height, this.roundCorners);
            this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, this.roundCorners);

            var txtConfig = { 
                fontFamily: 'Tahoma', 
                fontStyle : 'bold',
                fontSize: Math.floor(height * 0.35), 
                color: '#000' 
            };

            this.text = scene.add.text ( 0, 0, text, txtConfig ).setOrigin(0.5);

            //add to container...
            this.add ([this.shape, this.text]);


            scene.children.add ( this );
        },

        change : function ( clr ) {

            this.shape.clear();
            this.shape.fillStyle( clr, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);

            this.text.setColor ('#fff');
            
        },
        disabled : function () {
            
            this.shape.clear();
            this.shape.fillStyle( 0xdedede, 1);
            this.shape.lineStyle ( 1, 0x9a9a9a );
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);

            this.text.setColor ('#6a6a6a');
        

        },

        reset : function () {

            this.shape.clear();
            this.shape.fillStyle( this.bgColor, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);

            this.text.setColor ('#000');
            
            //console.log ( this.id, this.active )
            
        },
        
    
        
    });

    //..Controls...
    var Controls =  new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function Controls ( scene, id, x, y, rad, txt, icon, bgColor = 0x3c3c3c  )
        {

            Phaser.GameObjects.Container.call(this, scene)

            this.setPosition(x, y).setSize(rad * 2, rad * 2).setInteractive();

            scene.children.add ( this );

            this.id = id;
            this.x = x;
            this.y = y;
            this.rad = rad;
            this.bgColor = bgColor;
            this.txt = txt;
            this.state = false;        
            this.shape = scene.add.graphics ( { fillStyle: { color: bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            this.shape.fillCircle ( 0, 0, rad );
            this.shape.strokeCircle ( 0, 0, rad );

            var imgSize = rad * 2 * 0.7;

            this.image = scene.add.image ( 0, 0, 'thumbs', icon + 25 ).setScale ( imgSize/50 )

            this.up = scene.add.graphics();

            //add to container...
            this.add ([this.shape, this.up, this.image ]);

        },
        change : function ( clr ) {

            this.shape.clear();
            this.shape.fillStyle( clr, 1);        
            this.shape.fillCircle ( 0, 0, this.rad );

            this.shape.strokeCircle ( 0, 0, this.rad );

        },
        reset : function () {

            this.shape.clear();
            this.shape.fillStyle( this.bgColor, 1);
            this.shape.fillCircle ( 0, 0, this.rad );
            this.shape.strokeCircle ( 0, 0, this.rad );
            
        },
        toggle : function () {

            this.state = !this.state;
            
            if ( !this.state ) {
                this.up.clear();
            }else {
                this.up.clear();
                this.up.fillStyle( 0xff6600, 0.5 );        
                this.up.fillCircle ( 0, 0, this.rad * 0.85 );
            }
        }
    
        
    });

    //..PlayerIndicator...
    var PlayerIndicator = new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function PlayerIndicator ( scene, id, x, y, width, height, name, max )
        {
            Phaser.GameObjects.Container.call(this, scene)

            this.setPosition(x, y).setSize( width, height);

            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.winClr = ( id == 'self' ? '#ff6600' :  '#009933' );
            this.name = name;
            this.max = max;
            this.winCount = 0;
            this.maxTime = 0;
            this.scene = scene;


            this.shape = scene.add.graphics ( { fillStyle: { color: 0xf5f5f5,  alpha: 1 }, lineStyle : { color: 0xa4a4a4, width:1 } });

            this.shape.fillRoundedRect ( -width/2, -height/2, width, height, height * 0.15);
            this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, height * 0.15);
        

            //players name...
            var top = -height/2, 
                left = -width/2;

            var txtConfig = { 
                fontFamily: 'Trebuchet MS', 
                fontSize: Math.floor( height * 0.38 ), 
                fontStyle: 'bold',
                color: '#3a3a3a' 
            };

            var tX = left + (width * 0.13),
                tY = top + (height * 0.11); 

            this.text = scene.add.text ( tX, tY, name, txtConfig ).setOrigin(0);

            var bW = width * 0.025,
                bS = bW * 0.2,
                sX = left + (width * 0.13),
                sY = top + (height * 0.53); 
                

            var winTxtConfig = { color : '#ff6600', fontSize : height * 0.28, fontFamily : 'Trebuchet MS' };

            this.winTxt = scene.add.text ( sX, sY, '✪ Wins: 0', winTxtConfig );
            
            //timer
            var timertxtConfig = {
                fontSize : height * 0.38,
                fontFamily : 'Trebuchet MS',
                fontStyle : 'bold',
                color : '#6c6c6c'
            };
            this.timertxt = scene.add.text (left + width *0.93, top + height * 0.82, '', timertxtConfig ).setOrigin(1);

            //caption
            var captionConfig = {
                fontSize : height * 0.25,
                fontFamily : 'Trebuchet MS',
                fontStyle : "bold",
                color : '#6c6c6c'
            };
            this.caption = scene.add.text (left + width *0.93, top + height * 0.41, '', captionConfig ).setOrigin(1);

            //avatar
            var imgSize = height * 0.75;
            this.image = scene.add.image ( left + width * 0.07, 0, 'thumbs', 18 ).setScale ( imgSize/50 ).setVisible(true);


            this.bar = scene.add.graphics();

            this.add ([  this.shape, this.text, this.winTxt, this.timertxt, this.caption, this.bar, this.image ]); // add elements to this container..


            scene.children.add ( this ); //add to scene...
            
        },
        tick: function ( time ) {

            //if ( time <= 3 ) this.timertxt.setColor ( '#f33' );

            var fin = ( time < 10 ) ? '0' + time : time;

            this.timertxt.setText ( '00:00:' + fin );
            
            var oH = this.height * 0.6,
                bH = oH * time/this.maxTime,
                bW = this.width * 0.015;
        
            var top = -this.height/2,
                left = -this.width/2;

            this.bar.clear();
            //this.bar.fillStyle ( 0xcccccc, 1);
            //this.bar.fillRect ( left + this.width * 0.94, top + this.height * 0.8 - oH, bW, oH );
            
            this.bar.fillStyle ( time > 5 ? 0x00ff00 : 0xff0033, 1);
            this.bar.fillRect ( left + this.width * 0.94, top + this.height * 0.8 - bH, bW, bH );

            
            
        },
        timerOff :  function ( caption ) {
            
            this.timertxt.setVisible ( false );

            this.caption.setPosition ( this.width * 0.46, -this.height * 0.08 );

            this.caption.setText ( caption );

        },
        setTimer : function ( maxTime, caption ) {

            this.maxTime = maxTime;

            var fin = ( maxTime < 10 ) ? '0' + maxTime : maxTime;

            this.timertxt.setText ( '00:00:' + fin );
            this.caption.setText ( caption );

            var bH = this.height * 0.6,
                bW = this.width * 0.015;
        
            var top = -this.height/2,
                left = -this.width/2;

            this.bar.fillStyle ( 0x00ff33, 1);
            this.bar.fillRect ( left + this.width * 0.94, top + this.height * 0.8 - bH, bW, bH );

        },
        clearTimer : function () {
            this.timertxt.setText ('');
            this.caption.setText ('');
            this.bar.clear();
        },
        updateWins : function ( winCount ) {

            this.winCount = winCount;

            var left = -this.width/2,
                top = -this.height/2;

            this.winTxt.setText ( '✪ Wins : ' + winCount)
        },
        updateStatus : function () {

            this.image.setFrame( 17 )

            this.scene.tweens.add ({
                targets : this.image,
                scaleX : 0.2,
                scaleY : 0.2,
                duration : 100,
                ease : 'Power2',
                yoyo : true
            });

            //this.text.setText (  + this.name );
        },
        resetStatus : function () {
            this.clearTimer();
            this.image.setFrame ( 18 );
        }



    });

}
    