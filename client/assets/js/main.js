
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

        socket = io();

        socket.emit ('initUser', username.value );
    
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

            this.initSound ();

            this.initGraphicAndTitles ();

            this.initSelect ();

            this.initSocketIOListeners();

            setTimeout ( function () {
                socket.emit ('getPlayersOnline', null );
            }, 1000 );

            
        },
        initSocketIOListeners () {

            console.log ('listeners loaded');

            var _this = this;

            socket.on ('initGame', function ( data ) {
                
                _this.initGame (data);

            });
            socket.on ('playersOnline', function ( data ) {
                
                _this.music.play ('message');

                _this.playersOnlineTxt.text = 'Players Online : ' + data;

            });

        },
        initSound : function () {
            

            this.bgsound = this.sound.add ('introbg').setVolume(0.2).setLoop(true);
            this.bgsound.play();

            this.music = this.sound.addAudioSprite('sfx');

        },
        initGraphicAndTitles () {

            var graphics = this.add.graphics();
            graphics.fillStyle( 0x9a9a9a, 1);
            graphics.fillRect ( 0, config.height * 0.7 , config.width, config.height * 0.5 );


            var ptx = config.width * 0.03, 
                pty = config.height * 0.03;

            var textNameConfig = { 
                color:'#663300', 
                fontSize: config.height * 0.025, 
                fontFamily:'Trebuchet MS', 
                fontStyle: 'bold'  
            };

            var textName = this.add.text ( ptx, pty, 'Hi, ' + username.value + '!', textNameConfig );

            var polConfig = { 
                color : '#3c3c3c', 
                fontSize : config.height * 0.02, 
                fontStyle:'bold',
                fontFamily : 'Trebuchet MS'

            };

            var ptyb = config.height *0.065;

            this.playersOnlineTxt = this.add.text ( ptx, ptyb, 'Players Online : -', polConfig );

            var configtxt = { 
                color : '#000', 
                fontSize : config.height *0.1, 
                fontFamily:'Arial', 
                fontStyle: 'bold' 
            };
            
            var text = this.add.text ( config.width/2, config.height * 0.18, 'Salpakan 2.0', configtxt ).setOrigin(0.5);
            
            text.setStroke('#f4f4f4', 5).setShadow( 1, 1, '#666', true, true );

            var m = 5,
                r = config.width * 0.022,
                s = config.width * 0.03,
                t =  m * ( r + s ) - s;

            var xp = ( config.width - t )/2 + r/2,
                yp = config.height * 0.3;

            for ( var i=0; i<m; i++) {

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

        },
        initSelect : function () {

            this.selectGame = 0;
            this.selectGameType = 0;

            this.rects = [];
            this.rectsb = [];

            this.selects = {};
            

            var configtxt2 = { 
                color : '#6a6a6a', 
                fontSize : config.height *0.025, 
                fontFamily:'Trebuchet MS' 
            };

            var xt1 = config.width * 0.29,
                xt2 = xt1 + config.width * 0.3;

            var text2 = this.add.text ( xt1, config.height * 0.38, 'Select Game', configtxt2 )

            var text3 = this.add.text ( xt2, config.height * 0.38, 'Select Type', configtxt2 )

            var text_arr = [
                { name: 'Blitz', desc : '30 seconds preparation, 15 seconds per turn' },
                { name: 'Classic', desc : 'Untimed game' }
            ];

            var text_arr2 = [
                { name: 'vs Computer', desc : '' },
                { name: 'vs Online Players', desc : '' }
            ];

            var xo = config.width *0.54, yo = config.height * .45;

            var line = this.add.line (xo, yo, 0, 0, 0, config.height * 0.13, 0x9c9c9c, 1 ).setLineWidth (1);
            //
            var size = config.width * 0.023,
                sp = size * 0.5;

            var xp1 = config.width * 0.3,
                xp2 = xp1 + size,
                xp3 = xp1 + config.width* 0.3,
                xp4 = xp3 + size,
                ypa = config.height * 0.45;

            var _this = this;

            var selectTxtConfig = { 
                fontSize: size, 
                color : '#6a6a6a', 
                fontFamily:'Trebuchet MS' 
            };


            for ( var i=0; i < 2; i++) {

                var circ = this.add.circle ( xp1 , ypa +( i * ( size + sp ) ), size/2, 0x3a3a3a  );

                this.rects.push ( circ );

                var circb = this.add.circle ( xp3, ypa +( i * ( size + sp ) ), size/2, 0x3a3a3a  );

                this.rectsb.push ( circb );

                var txt = this.add.text ( xp2, ypa + i * ( size + sp ), text_arr2[i].name, selectTxtConfig ).setOrigin(0, 0.5);

                var txtb = this.add.text ( xp4, ypa + i * ( size + sp ), text_arr[i].name, selectTxtConfig ).setOrigin(0, 0.5);

                var rcW = config.width * 0.22,
                    rcWb = config.width * 0.12,
                    rcH = size * 1.1,
                    rcX = xp1 + (rcW/2) - (size/2),
                    rcXb = xp3 + (rcWb/2) - (size/2),
                    rcY = ypa;

                var recttop = this.add.rectangle ( rcX, rcY + i * ( size + sp ), rcW, rcH ).setInteractive().setData( 'game', i );

                recttop.on('pointerdown', function () {

                    var gamedata = this.getData('game');

                    if ( _this.selectGame != gamedata ) {

                        _this.selectGame = gamedata;

                        _this.srect.setPosition ( _this.rects[gamedata].x, _this.rects[gamedata].y );

                        _this.music.play ('clickc');

                    }

                });

                this.selects ['game' + i ] = recttop;


                var recttopb = this.add.rectangle ( rcXb, rcY + i * ( size + sp ), rcWb, rcH ).setInteractive().setData( 'type', i );

                recttopb.on('pointerdown', function () {

                    var type = this.getData('type');

                    if ( _this.selectGameType != type ) {

                        _this.selectGameType = type;

                        _this.srectb.setPosition ( _this.rectsb [type].x, _this.rectsb[type].y );

                        _this.txtDesc.setText ( '✱ ' + text_arr[ type ].desc );

                        _this.music.play ('clickc');
                    }

                });

                this.selects ['type' + i ] = recttopb;

            }

            this.srect = this.add.circle ( this.rects[0].x,  this.rects[0].y, size/2*0.6, 0xff0000 );

            this.srectb = this.add.circle ( this.rectsb[0].x,  this.rectsb[0].y, size/2*0.6, 0xff0000 );

            var txtDescConfig = { 
                fontSize: size * 0.7, 
                color : '#3a3a3a', 
                fontFamily:'Trebuchet MS' 
            };

            this.txtDesc = this.add.text ( config.width/2, config.height * 0.61, '✱ ' + text_arr[0].desc, txtDescConfig ).setOrigin(0.5)


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

            playBtn.on('pointerdown', function () {

                _this.music.play ('clicka');

                var toSendData = {
                    'isSinglePlayer' :  _this.selectGame == 0 ? true : false,
                    'isTimed' : _this.selectGameType == 0 ? true : false
                }

                if ( _this.selectGame == 1) {

                    socket.emit ('enterGame', toSendData );

                    _this.showWaitScreen ();

                }else {

                    _this.disableButtons();

                    socket.emit ('enterGame', toSendData );
                    
                }
                
                
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

            this.selects ['playBtn'] = playBtn;

        },
        disableButtons : function ( disabled = true ) {

            if ( disabled ) {

                for ( var i in this.selects ) {
                    this.selects[i].removeInteractive();
                }

            }else {

                for ( var i in this.selects ) {
                    this.selects[i].setInteractive();
                }
            }
            
            
        },
        showWaitScreen : function () {

            var _this = this;

            this.screenElements = [];

            this.disableButtons ();

            var graphics = this.add.graphics();
            graphics.fillStyle ( 0x0a0a0a, 0.8 );
            graphics.fillRect ( 0, 0, config.width, config.height );

            var bW = config.width *0.4,
                bH = config.height  *0.25,
                bX = (config.width - bW )/2,
                bY =  (config.height - bH)/2;

            graphics.fillStyle ( 0xdedede , 0.9 );
            graphics.fillRoundedRect ( bX, bY, bW, bH, bH * 0.03 );


            var rW = bW * 0.5,
                rH = bH * 0.2,
                rX = bX + (bW - rW)/2,
                rY = bY + (bH * 0.57) + (rH/2);

            graphics.fillStyle ( 0x3c3c3c , 1 );
            graphics.fillRoundedRect ( rX, rY, rW, rH, rH * 0.1 );

            this.screenElements.push ( graphics );
            //
           

            var txtConfig = {
                color : '#3c3c3c',
                fontSize : bH *0.12,
                fontFamily : 'Trebuchet MS',
                fontStyle : 'bold'
            };

            var tx = bX + bW/2,
                ty = bY + bH *0.25;

            var txt = this.add.text ( tx, ty, 'Waiting for players..' , txtConfig ).setOrigin(0.5);

            this.screenElements.push ( txt );

            var max = 5;

            var bSize = config.width * 0.01,
                bSpace = config.width * 0.02,
                bTotal = max * ( bSize + bSpace ) - bSpace;
                cX = (config.width - bTotal) /2,
                cY = bY + (bH *0.45) + (bSize/2);
                
            var duration = 500, delay = duration/max;

            for ( var i=0; i<max; i++) {

                var rect = this.add.circle ( cX + i*( bSize+ bSpace), cY, bSize/2, 0x6c6c6c, 1 );
        
                this.tweens.add ({
                    targets : rect,
                    scaleX : 1.5,
                    scaleY : 1.5,
                    duration : duration,
                    ease : 'Power2',
                    repeat : -1,
                    yoyo : true,
                    delay : i * delay,
                });

                this.screenElements.push (rect);

            }

            var btx = rX + (rW/2),
                bty = rY + (rH/2) ;

            var back = this.add.text ( btx, bty, 'Cancel', { color : '#f3f3f3', fontSize : bH * 0.11, fontFamily : 'Trebuchet MS'}).setOrigin ( 0.5 );

            this.screenElements.push (back);

            var hitArea = this.add.rectangle ( btx,bty, rW, rH, 0x343434, 0.1 ).setInteractive();

            hitArea.on ('pointerover', function () {
                back.setColor ( '#ff3300');
            });
            hitArea.on ('pointerout', function () {
                back.setColor ('#f3f3f3' );
            });
            hitArea.on ('pointerdown', function () {

                socket.emit ('leaveGame');

                _this.music.play('clicka');

                _this.removeWaitScreen();

            });

            this.screenElements.push (hitArea);

        },
        removeWaitScreen : function () {

            for ( var i in this.screenElements) {
                this.screenElements[i].destroy();
            }

            this.disableButtons (false);

        },
        initGame : function ( data ) {

            socket.removeAllListeners();

            this.bgsound.stop();

            this.scene.start('sceneA', data );

        }

    });

    var SceneA = new Phaser.Class({

        Extends: Phaser.Scene,

        initialize:

        function SceneA ()
        {
            Phaser.Scene.call(this, { key: 'sceneA' });
        },

        init: function (data) {

            //console.log ( data );

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

            this.gameData = {};
            
            this.gamePhase = 'prep';
            this.activePiece = '';
            this.turn = '';
            this.isWinning = '';
            this.endWinner = '';

            this.isSinglePlayer = data.isSinglePlayer;
            this.isTimed = data.isTimed;
            //this.playerName = data.username;
            this.playersData = data.players;

            this.elimScreenShown = false;
            this.isPrompted = false;
            this.isEmoji = false;
            this.isMessages = false;

            this.playerResign = false;

            this.presetIndex = 0;
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

            this.presetIndex = Math.floor ( Math.floor(Math.random()*6) );;

            var postArr = this.presetPost ( this.presetIndex );

            
            this.createGameData();

            this.createPanels();

            this.createGrid ();

            this.createPlayers();

            this.createPlayerIndicator ();

            this.createGamePiecesData ('self', postArr );

            this.createGamePieces('self');

            this.initializeGameSounds();

            this.initSocketIOListeners();

            setTimeout ( function () {
                
                _this.createButtons ();

                _this.createGameControls();

                _this.startPreparations ();
        
            }, 800);

        },
        initSocketIOListeners : function () {

            var _this = this;


            socket.on ('opponentReveal', function ( data ) {

                for ( var i in data ) {

                    var piece = _this.gamePiece [ 'oppo_' + data[i].cnt ];

                    piece.rnk = data[i].rank;

                    piece.flip();

                }
                
                _this.music.play ('bleep');
                _this.plyrInd ['oppo'].updateStatus ();



            });
            socket.on ('opponentResign', function ( data ) {

                _this.playerResign = true;

                _this.endGame ('self');

            });
            socket.on ('moveResult', function ( data ) {

                _this.isWinning = data.isWinning;

                if ( data.clashResult < 0 ) {
                    _this.movePiece ( data.post, _this.turn );
                }else {
                    _this.clash ( data.post, data.clashResult );
                }

                _this.removeBlinkers();

                _this.removeActive ();

                if ( !data.win ) {
                    _this.switchTurn();
                }else {
                    _this.endGame ( _this.turn );
                }
                
            });
            socket.on ('oppoPieceClick', function ( data ) {

                var piece = _this.gamePiece ['oppo_' + data.cnt ];

                _this.removeBlinkers();

                if ( data.active ) {

                    piece.activate();

                    _this.removeActive();
                    _this.createBlinkers ( piece.post, false);
                    _this.activePiece = piece.id;
                
                }else {

                    piece.reset();

                    _this.removeActive();
                    _this.playSound ('pick');

                }


            });
            socket.on ('onePlayerReady', function ( data ) {

                if ( data.self ) _this.plyrInd ['self'].ready();

                if ( data.oppo ) _this.plyrInd ['oppo'].ready();

            });
            socket.on ('opponentLeft', function ( data ) {

                if ( _this.isPrompted ) _this.clearPrompt();

                clearInterval (_this.timer);

                _this.removeButtons ();
                _this.enabledPieces ('self', false );
                _this.enabledPieces ('oppo', false );
                _this.gamePhase = 'end';

                setTimeout(() => {
                    _this.showPrompt ('Opponent has left the game.', '', false, 0.05 );
                }, 200);
                
            });
            socket.on("resetGame", function () {
			
                if ( _this.isPrompted ) _this.removePrompt ();

                setTimeout (function () {
                    _this.resetGame();
                }, 200 )
                
            });
            socket.on ('gridClickResult', function (data) {

                //update data..
                for ( var i=0; i<100; i++) {
                    _this.gameData ['self'].grid [i].isTrashed = data.self.grid[i].isTrashed;
                    _this.gameData ['self'].grid [i].isResided = data.self.grid[i].isResided;

                    _this.gameData ['oppo'].grid [i].isTrashed = data.oppo.grid[i].isTrashed;
                    _this.gameData ['oppo'].grid [i].isResided = data.oppo.grid[i].isResided;
                }

                for ( var i=0; i<6; i++) {
                    _this.gameData ['self'].fleet[i].remains = data.self.fleet[i].remains;
                    _this.gameData ['oppo'].fleet[i].remains = data.oppo.fleet[i].remains;
                }

                _this.showHit ( _this.turn, data.post, data.shipIndex, data.isHit );

                _this.activateGrid (false);

                if ( data.isHit ) {

                    _this.music.play ('explosionb');

                    var opp = _this.turn == 'self' ? 'oppo' : 'self';

                    if ( data.shipSunk != null ) {
    
                        setTimeout ( function () {

                            if ( _this.turn =='self' && _this.view == 'self' ) {
                                _this.showShip ( data.shipSunk );
                            }
                            _this.music.play ('warp');
                            
                        }, 400);
                            
                    }

                    if ( data.isWinner ) {

                        _this.gameOn = false;
                        
                        setTimeout ( function () {
                            _this.endGame();
                        }, 800);

                    }else {

                        if ( _this.turn == 'self' && _this.view == 'self') {
                            setTimeout ( function () {
                                _this.activateGrid(); 
                            }, 800);
                        }
                        

                    }

                }else {

                    _this.music.play ('explosiona');

                    setTimeout ( function () {
                        _this.switchTurn ();
                    }, 1000);
                    
                }

            });
            socket.on ('startGame', function ( data ) {
                
                _this.turn = data.turn;

                _this.gameData['oppo'].pieces = data.oppoData;

                _this.createGamePieces ('oppo');

                _this.startGame();

            });

        },
        initializeGameSounds: function () {


            this.bgmusic = this.sound.add ('bgsound',);
            this.bgmusic.setLoop(true).setVolume(0.2);
            this.bgmusic.play();

            this.tick = this.sound.add ('clocktick').setVolume(0.2);

            this.music = this.sound.addAudioSprite ('sfx');

        },
        createGameData : function () {
            this.gameData ['self'] = { 'pieces' : [] };
            this.gameData ['oppo'] = { 'pieces' : [] };
        },
        createPlayers : function () 
        {

            var oppNames = [ 'Rodrigo', 'Corazon', 'Emilio', 'Ramon', 'Fidel', 'Marlon', 'Ayesha', 'Albert', 'Muhammad', 'Ibrahim', 'Carlos' ];

            var self_name = '', oppo_name = '', self_type = 0, oppo_type = 0; 

            if ( this.isSinglePlayer ) {

                var rand = Math.floor ( Math.random() * oppNames.length );

                self_name = this.playersData.self.name;

                self_type = Math.floor ( Math.random() * 2 );
                
                oppo_name = oppNames [ rand ] + '™';

                oppo_type = self_type == 0 ? 1 : 0;

            }else {

                self_name = this.playersData.self.name;

                self_type = this.playersData.self.type;

                oppo_name = this.playersData.oppo.name;

                oppo_type = this.playersData.oppo.type;
            }
        
            this.player [ 'self' ] = { 
                id : 'self', 
                name : self_name,
                wins: 0, 
                type : self_type, 
                isAI : false 
            };

            this.player [ 'oppo' ] = { 
                id : 'oppo', 
                name : oppo_name,  
                wins: 0, 
                type : oppo_type,
                isAI : this.isSinglePlayer 
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

                    var txt = this.add.text ( gX + j*gW, gY + i*gH, counter, txtConfig );
                    
                    this.grid. push ({

                        x : gX + j*gW + gW/2, 
                        y : gY + i*gH + gH/2,
                        width : gW,
                        height : gH,
                        row  : i,
                        col : j,
                        cnt : counter,
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
                    { id : 'preset', value : '☗ Preset' },
                    { id : 'random', value : '☋ Random' },
                    { id : 'ready', value : '✔ Ready' }
                ];

            }else {
                
                buts = [
                    { id : 'proposedraw', value : '⚖ Propose Draw' },
                    { id : 'resign', value : '⚑ Resign' },
                    { id : 'showpieces', value : '❖ Reveal Pieces' }
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
                    this.change ();
                });
                but.on('pointerout',  function () {
                    this.reset();
                });
                but.on('pointerup',  function () {
                    this.reset()
                });
                
                but.on('pointerdown', function () {

                    this.change ( 0x00ffff );
                    
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
                            _this.playerReady();
                        break;
                        case 'resign' :
                            //..

                            this.disableInteractive();

                            if ( _this.isPrompted ) _this.clearPrompt();

                            setTimeout ( function () {                        
                                _this.showResignScreen();
                            }, 100);

                        break;
                        case 'proposedraw' :
                            //..

                            this.disableInteractive();

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

                            this.disableInteractive();

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

                    _this.playSound('clicka');

                    switch (this.id) {
                        case 'cont0' :

                            if ( _this.isEmoji ) {
                                _this.toggleEmojis();
                                _this.controls[3].toggle();
                            }

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

                            if ( _this.elimScreenShown ) {
                                _this.toggleElimPiecesScreen();
                                _this.controls[0].toggle();
                            }

                            _this.toggleEmojis ();

                            this.toggle();
                           
                        break;

                        case 'cont4' :

                            if ( _this.gamePhase != 'end' ) {

                                this.disableInteractive();

                                if ( _this.isEmoji ) {
                                    _this.toggleEmojis();
                                    _this.controls[3].toggle();
                                }

                                if ( _this.elimScreenShown ) {
                                    _this.toggleElimPiecesScreen();
                                    _this.controls[0].toggle();
                                }

                                if ( _this.isPrompted ) _this.clearPrompt();

                                setTimeout ( function () {                        
                                    _this.showLeaveScreen();
                                }, 100);

                            }else{

                                _this.leaveGame ();
                            }
                            
                        break;
                        
                    }


                });

                this.controls.push ( cntrols );
            }
            
            var txtConfig = {
                color : '#300',
                fontSize : config.height * 0.02,
                fontFamily : 'Trebuchet MS',
                fontStyle : 'bold'
            };

            var tx = config.width * 0.75,
                ty = config.height * 0.978;

            this.controlsText = this.add.text ( tx, ty, '', txtConfig ).setOrigin(1);

        },
        createGamePiecesData : function ( plyr, postArr ) {

            var gamePieces = [
                { rank : 1, count : 1 },{ rank : 2, count : 1 },{ rank : 3, count : 1 },{ rank : 4, count : 1 },
                { rank : 5, count : 1 },{ rank : 6, count : 1 },{ rank : 7, count : 1 },{ rank : 8, count : 1 },
                { rank : 9, count : 1 },{ rank : 10, count : 1 },{ rank : 11, count : 1 },{ rank : 12, count : 1 },
                { rank : 13, count : 6 },{ rank : 15, count : 2 }, { rank : 14, count : 1 }
            ];

            this.gameData [plyr].pieces = [];

            var counter = 0;

            for ( var i = 0; i< gamePieces.length ; i++) {

                for ( var j = 0; j < gamePieces[i].count; j++) {

                    var post = plyr == 'oppo' ? postArr[counter]  : postArr[counter] + 45;
                 
                    this.gameData [plyr].pieces.push ({
                        'post' : post, 
                        'rank' : gamePieces[i].rank,
                        'cnt' : counter
                    });

                    counter++;

                }
            }


        },
        createGamePieces : function ( plyr ) {

            var _this = this;

            var type = this.player[ plyr ].type;

            var active = ( plyr == 'self' ) ? true : false;

            var piecesData = this.gameData [plyr].pieces;

            
                

            for ( var i = 0; i < piecesData.length; i++ ) {

                var myPost = piecesData[i].post;

                var myGrid = this.grid [ myPost ];
            
                var gW = myGrid.width * 0.9,
                    gH = myGrid.height * 0.85;
            
                var initX = plyr == 'self' ? -gW/2 : config.width + gW/2;

                var gp = new GamePiece ( this, plyr +'_'+ i, initX, myGrid.y, gW, gH, piecesData[i].rank, type, myPost, plyr, i, active );
            
                gp.on ('pointerdown', function () {
                    
                    if ( _this.isPrompted ) return;

                    _this.removeBlinkers();

                    if ( !this.activated ) {

                        this.activate();
                        _this.removeActive();
                        _this.createBlinkers (this.post);
                        _this.activePiece = this.id;
                    
                    }else {

                        this.reset();
                        _this.removeActive();
                        _this.playSound ('pick');

                    }

                    if ( _this.gamePhase == 'proper' &&  !_this.isSinglePlayer ) 
                        socket.emit ( 'pieceClick' , { 'active' : this.activated, 'cnt' : this.cnt } );

                });

                this.tweens.add ({

                    targets : gp,
                    x : myGrid.x,
                    duration : 300,
                    ease : 'Elastic',
                    easeParams : [ 0.5, 1.2 ],
                    delay : i * 10
                });
                
                //if ( plyr == 'self' ) gp.flip();

                gp.flip();

                myGrid.residentPlayer = plyr;
                myGrid.resident = gp.id;
                
                this.gamePiece [ plyr+'_'+ i ] = gp;
                
            }

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
                            
                            _this.removeActive();
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
        toggleEmojis : function () {

            this.isEmoji = !this.isEmoji;

            if ( this.isEmoji ) {

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
                        
                        if (_this.isMessages ) _this.removeEmojis();

                        _this.showSentEmojis ( this.getData('count') );

                        _this.playSound('message');

                        _this.toggleEmojis();

                        _this.controls[3].toggle();

                        if ( _this.isSinglePlayer ) _this.autoRespond();

                    });
                    
                    this.clickables.push ( clicks );

                    var imgsize = esize * 0.9;

                    var emoji = this.add.image ( xpos , ypos, 'thumbs', 30 + i ).setScale(imgsize/50).setDepth (998);

                    this.myEmojis.push ( emoji );

                    

                }

            }else {

                for ( var i = 0; i< this.myEmojis.length ; i++ ) {

                    this.myEmojis[i].destroy();
    
                    this.clickables[i].destroy();
                }
    
                this.myEmojis = [];
    
                this.clickables = [];

            }

        },
        toggleElimPiecesScreen : function () {

            this.elimScreenShown = !this.elimScreenShown;
            
            if ( this.elimScreenShown ) {
                
                var cW = config.width,
                    //cH = config.height * 0.824,
                    cH = this.fieldHeight,
                    cX = config.width/2,
                    //cY = config.height * 0.512;
                    cY = this.fieldY + (cH/2);

                this.elimScreen = this.add.rectangle( cX - cW * 0.6, cY, cW, cH, 0x0a0a0a, 0.9 );
                this.elimScreen.setInteractive().setDepth (1000);

                this.tweens.add ({
                    targets : this.elimScreen,
                    x : cX,
                    duration : 300,
                    ease : 'Power2'
                });


                this.line1 = this.add.line ( -(config.width/2) * 0.6 , config.height * 0.45, 0, 0, 0, config.height * 0.5, 0xf4f4f4, 1 ).setDepth ( 1000 );

                this.tweens.add ({
                    targets : this.line1,
                    x : config.width/2,
                    duration : 300,
                    ease : 'Power2'
                });

                /* 
                this.circs = [];

                var size = config.width * 0.008,
                    spacing = config.height * 0.03;

                for ( var j=0; j<5; j++) {

                    var circ = this.add.ellipse( config.width/2 - (cW * 0.8), (config.height * 0.25) + j * ( size + spacing ), size, size, 0xf4f4f4);
                    
                    circ.setDepth ( 1000 );

                    this.tweens.add ({
                        targets : circ,
                        x : config.width/2,
                        duration : 300,
                        ease : 'Power2'
                    });

                    this.circs.push ( circ );
                } */

                
                var configtxt = {
                    color : '#f4f4f4',
                    fontSize : config.height * 0.03,
                    fontFamily : 'Arial',
                    fontStyle : 'bold'
                };

                this.texta = this.add.text( config.width/2 - (cW*0.8), config.height * 0.15, '☒ Eliminated Pieces', configtxt).setOrigin(0.5).setDepth(1000);

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

                        gp.setVisible(true).setDepth (2000);
                        gp.reset();
                        
                        //if ( !gp.isOpen ) gp.flip();
                        
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

                        gp.setVisible (true).setDepth (2000);
                        gp.reset();

                        //if ( !gp.isOpen ) gp.flip();

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
                this.line1.destroy();
                for ( var i in this.gamePiece ) {
                    if ( this.gamePiece[i].isDestroyed ) {
                        this.gamePiece[i].setVisible (false);
                    }
                }
                /* 
                for ( var j=0; j<this.circs.length; j++ ) {
                    this.circs[j].destroy();
                } */

                
                //todo..
            }
            

        },
        showSentEmojis : function ( frame, plyr = 'self' ) {

            this.isMessages = true;

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

            var _this = this;

            clearTimeout ( this.timeDissolve );
            this.timeDissolve = setTimeout ( function () {
                 _this.removeEmojis();
            }, 3000 );

        },
        removeEmojis : function () {
            
            this.isMessages = false; 

            clearTimeout ( this.timeDissolve );

            for ( var i in this.msgelements ) {
                this.msgelements[i].destroy();
            }
            this.msgelements = [];

        },
        autoRespond: function () {

            var _this = this;
            setTimeout ( function () {

                if ( _this.isMessages ) _this.removeEmojis();
                
                _this.playSound ('message');
                
                _this.showSentEmojis ( Math.floor ( Math.random() * 9 ), 'oppo' );
                
            }, 1000 );

        },
        checkMove :  function (post) {

            this.removeBlinkers();

            if ( this.isSinglePlayer ) {

                var myGrid = this.grid[ post ];

                if ( myGrid.resident != '' &&  myGrid.residentPlayer != this.turn ) {

                    var clashResult = this.getClashResult ( post );

                    this.clash ( post, clashResult);

                    this.analyzeClash ();

                }else {
                    
                    this.movePiece ( post, this.turn );
                    
                    this.analyzePieceMove ();
                    
                }
            
            }else {

                //..
                this.enabledPieces ('self', false );

                var piece = this.gamePiece [ this.activePiece ];

                socket.emit ('pieceMove', { 'piece' : piece.cnt, 'post' : post });

            }
            
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

            var piece = this.gamePiece [ this.activePiece ];

            var origPost = this.grid [ piece.post ] ;

            var destPost = this.grid [post];

            this.tweens.add ({

                targets : piece,
                x : destPost.x, 
                y : destPost.y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1, 0.5]
            
            });

            piece.post = post;
            piece.reset();

            origPost.residentPlayer = '';
            origPost.resident = '';
            
            destPost.residentPlayer = plyr;
            destPost.resident = piece.id;            

            this.playSound('move');

        },
        analyzePieceMove : function () {

            var piece = this.gamePiece [ this.activePiece ];

            var newPost = this.grid [ piece.post ];

            var win = false;    

            if ( piece.rnk == 14 && piece.origin == 'bot' && newPost.row == 0  || piece.rnk == 14 && piece.origin == 'top' && newPost.row == 7  ) {
                
                var sorrounded = this.checkNearby ( piece.post, piece.plyr );

                if ( sorrounded ) {

                    this.isWinning = this.turn;

                }else {
                    
                    this.endGame ( this.turn );

                    this.playSound('home');

                    win = true;
                }

            }

            //console.log ('this is called');

            this.removeActive ();

            if ( !win ) this.switchTurn();

        },
        clash ( post, clashResult ) {

            this.pieceRemoved = '';

            var destPost = this.grid [post];

            var residentPiece = this.gamePiece [ destPost.resident ];

            var movingPiece = this.gamePiece [ this.activePiece ];

            this.tweens.add ({
                targets : movingPiece,
                x : destPost.x, 
                y : destPost.y,
                duration : 300,
                ease : 'Elastic',
                easeParams : [1, 0.5]
            });

            var origPost = this.grid [ movingPiece.post ] ;

            origPost.residentPlayer = '';
            origPost.resident = '';

            switch ( clashResult ) {

                case 0 : 

                    movingPiece.isDestroyed = true;
                    movingPiece.setVisible(false);

                    residentPiece.isDestroyed = true;
                    residentPiece.setVisible(false);
                    
                    destPost.resident = '';
                    destPost.residentPlayer = '';

                    //delete this.gamePiece[ this.activePiece];;
                    //delete this.gamePiece[ destPost.resident ];

                    this.createAnim ( destPost.x - destPost.width *0.25, destPost.y, 0 );
                    this.createAnim ( destPost.x + destPost.width *0.25, destPost.y, 1 );

                    this.playSound ('clashdraw');

                break;
                case 1 : 

                    destPost.resident = movingPiece.id;
                    destPost.residentPlayer = this.turn;

                    movingPiece.post = post;

                    residentPiece.isDestroyed = true;
                    residentPiece.setVisible(false);

                    this.pieceRemoved = residentPiece.id;

                    this.createAnim ( destPost.x, destPost.y, residentPiece.type );

                    this.playSound ( residentPiece.plyr == 'self' ? 'clashlost' : 'clashwon' );


                break;
                case 2 : 

                    movingPiece.isDestroyed = true;
                    movingPiece.setVisible(false);

                    this.pieceRemoved = movingPiece.id;

                    this.tweens.add ({
                        targets : residentPiece,
                        rotation : Math.PI/180 * 10, 
                        duration : 100,
                        yoyo : 'true',
                        ease : 'Elastic',
                        easeParams : [1.2, 0.5]
                    });

                    this.createAnim ( destPost.x, destPost.y, movingPiece.type );
                    
                    this.playSound ( movingPiece.plyr == 'self' ? 'clashlost' : 'clashwon' );

                break;

                default : 
                    //nothing to do here...
                
            }
        },
        analyzeClash : function () {

            var win = false;

            if ( this.pieceRemoved != '' ) {

                var pieceRemoved = this.gamePiece [this.pieceRemoved ];

                var oppoPlayer = pieceRemoved.plyr == 'self' ? 'oppo' : 'self';

                if ( pieceRemoved.rnk == 14 ) {
                    this.endGame (oppoPlayer);
                    win = true;
                }
            
                this.pieceRemoved = '';

                this.removeActive ();
            }
            
            if ( !win ) this.switchTurn();
            
        },
        switchPieces: function (post) {
            
            this.playSound('move');

            var p1 = {
                x : this.gamePiece [ this.activePiece ].x,
                y : this.gamePiece [ this.activePiece ].y,
                id : this.gamePiece [this.activePiece].id,
                post : this.gamePiece [ this.activePiece ].post,
                cnt : this.gamePiece [ this.activePiece ].cnt,
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

                var piece = this.gamePiece[this.activePiece];

                if ( !piece.isDestroyed ) piece.reset();
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
        startPreparations : function () {

            var _this = this;

            if ( !this.isTimed ) {

                this.plyrInd ['self'].offTimer ('· Preparation' );

            }else {

                var timeCount = 0;

                var max = this.maxPrepTime;
                
                this.plyrInd ['self'].setTimer ( max, '· Preparation' );
                    
                clearInterval ( this.timer );

                this.timer = setInterval (function () {

                    timeCount++;

                    _this.plyrInd ['self'].tick ( max - timeCount );
                    
                    if ( timeCount >= max) {
                        clearInterval( _this.timer );
                        
                        _this.playerReady();

                        _this.playSound ('warp');

                    }else {

                        _this.playSound ('tick');
                    }

                }, 1000);

            }
        
        },
        playerReady: function () {

            clearInterval (this.timer);

            this.removeActive();

            this.removeBlinkers();

            this.removeButtons();

            this.plyrInd['self'].clearTimer();

            this.enabledPieces ('self', false );

            if ( this.isSinglePlayer ) {

                this.turn = this.player['self'].type == 0 ? 'self' : 'oppo';

                var rand = Math.floor ( Math.random() * 6 );

                this.createGamePiecesData ( 'oppo', this.presetPost ( rand ) );

                this.createGamePieces ( 'oppo' );
                
                this.startGame ();

            }else {

                this.showPrompt ('Waiting for other player..', '', false, 0.05 );
                var toSend = this.getGamePieceData ('self');

                socket.emit ( 'playerReady', toSend );

            }

            
        },
        getGamePieceData : function ( plyr ) {

            var arr = [];

            for ( var i in this.gamePiece ) {

                var piece = this.gamePiece [i];

                if ( piece.plyr == plyr ) {
                    arr.push ({
                        'post' : piece.post,
                        'rank' : piece.rnk,
                        'cnt' : piece.cnt
                    });
                }

            }
            return arr;

        },
        startGame: function () {

            if ( this.isPrompted ) this.clearPrompt();

            this.plyrInd['self'].clearTimer();
            this.plyrInd['oppo'].clearTimer();
            
            this.gamePhase = 'proper';

            var _this = this;

            setTimeout ( function () {

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

            if ( this.isSinglePlayer ) {
                
                this.enabledPieces ('self', this.turn == 'self' && !this.player['self'].isAI );

                this.enabledPieces ('oppo', this.turn == 'oppo' && !this.player['oppo'].isAI );

                if ( this.isTimed) {
                    
                }else {
                    
                }

                if ( this.player[this.turn].isAI == true ) {

                    setTimeout(function () {
                        _this.autoPick();
                    }, 500);
                }

            }else {

                this.enabledPieces ('self', this.turn == 'self');

            }
            
        },
        startBlitzTimer : function () {

            var _this = this;

            var opp = this.turn == 'self' ? 'oppo' : 'self';

            this.plyrInd[opp].clearTimer();

            if ( !this.isTimed ) {

                this.plyrInd [this.turn].offTimer('· Your Turn');

                this.plyrInd [this.turn].change ( 0xffff99);
                

            }else {
                
    
                this.plyrInd[this.turn].setTimer ( this.maxBlitzTime, '· Your Turn' );

                this.plyrInd [this.turn].change ( 0xffff99 );
                
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

            }

        },
        getClashResult : function ( post ) {

            var grid = this.grid [post];

            var movingPiece = this.gamePiece [ this.activePiece ];

            var residentPiece = this.gamePiece [ grid.resident ];

            var rankA = movingPiece.rnk, rankB = residentPiece.rnk;

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
        endGame: function ( winner ) {

            clearInterval (this.timer);

            this.enabledPieces ('self', false );
            this.enabledPieces ('oppo', false );
    
            this.removeButtons();

            this.player[winner].wins += 1;
            
            this.gamePhase = 'end';

            this.endWinner = winner;

            var _this = this;
            
            if ( this.isPrompted ) this.clearPrompt();

            setTimeout ( function () {

                _this.plyrInd[winner].updateWins (_this.player[winner].wins);

                _this.revealPieces();

                _this.showEndScreen();

            }, 500 );

        },
        showCommenceScreen :  function () {
            
            this.commenceElements = [];

            var cH = config.height * 0.2,
                cX = ( config.width - cH )/2,
                cY = this.fieldY + ( ( this.fieldHeight - cH )/2 );

            var graphics = this.add.graphics();

            var sW = config.width, 
                sH = this.fieldHeight,
                sX = 0, sY = this.fieldY;

            graphics.fillStyle (0x0a0a0a, 0.5);
            graphics.fillRect ( sX, sY, sW, sH);

            graphics.fillStyle ( 0x6c6c6c, 0.2 );
            //graphics.fillRoundedRect ( cX, cY, cW, cH, cH * 0.05 );
            graphics.fillCircle ( cX + cH/2, cY + cH/2, cH/2 );
            graphics.lineStyle ( 1, 0x3a3a3a, 0.9 );
            //graphics.strokeCircle ( cX + cH/2, cY + cH/2, cH/2 );

            var tX = cX + cH/2,
                tY = cY + cH/2;

            var starAnim = this.add.star ( tX, tY, 20, (cH*0.4) * 0.9, cH*0.4,  0xffff00, 1 ).setScale ( 0.3 );

            var starAnim2 = this.add.star ( tX, tY, 20, (cH*0.35) * 0.9, cH*0.35,  0xffcc00, 1 ).setScale ( 0.3 );

            this.tweens.add ({
                targets : [starAnim, starAnim2],
                scaleX : 1,
                scaleY : 1,
                rotation : 2,
                ease : 'Power2',
                yoyo : true,
                duration : 500,
                repeat : 2
            });
            
            this.commenceElements.push ( graphics );
            this.commenceElements.push ( starAnim );
            this.commenceElements.push ( starAnim2 );
            
            var txtConfig = {
                color : '#f5f5f5',
                fontSize : cH * 0.6,
                fontFamily : 'Arial',
                fontStyle : 'bold'
            };

            this.commenceText = this.add.text ( tX, tY, '3', txtConfig).setOrigin(0.5);
            this.commenceText.setStroke('#6c6c6c', 5);

            this.playSound ('beep');


            //..counter..

            var counter = 0, max = 3;

            var _this = this;
            

            clearInterval (this.timer);

            this.timer = setInterval( function () {

                counter++;
                
                _this.commenceText.setText ( max - counter );
            
                if ( counter >= max ) {
                
                    clearInterval (_this.timer);

                    for ( var i in _this.commenceElements ) {
                        _this.commenceElements [i].destroy();
                    }
                    _this.commenceText.destroy();

                    _this.createButtons (true);
                    _this.makeTurn ();
                    _this.playSound ('bell');

                }else {

                    _this.playSound ('beep');

                }

            }, 1000 );

        },
        showPrompt : function ( text, caption = '', withButtons = false, promptTxtSize = 0.08 ) {

            this.isPrompted = true;

            this.promptElements = [];

            var pGraphics = this.add.graphics({ lineStyle : {width : 1, color : 0xf5f5f5 }}).setDepth ( 999 );

            var gW = config.width * 0.6,
                gH = withButtons ? config.height * 0.3 : config.height * 0.12,
                gX = ( config.width - gW )/2,
                gY = this.fieldY + ( ( this.fieldHeight - gH )/2 );

            var sW = config.width, 
                sH = this.fieldHeight,
                sX = 0, sY = this.fieldY;

            pGraphics.fillStyle (0x0a0a0a, 0.5 );
            pGraphics.fillRect ( sX, sY, sW, sH);

            pGraphics.fillStyle (0x3a3a3a, 0.9 );
            pGraphics.fillRoundedRect ( gX, gY, gW, gH, gH * 0.05 );

            this.promptElements.push ( pGraphics );
            
            var txtConfig = {
                color : '#fff',
                fontSize : gW * promptTxtSize,
                fontFamily : "Trebuchet MS",
                fontStyle : 'bold'
            };
            
            var tx = gX + gW/2,
                ty = withButtons ? gY + gH * 0.35 : gY + gH/2;

            var promptTxt = this.add.text ( tx, ty, text, txtConfig).setOrigin(0.5).setDepth ( 999 );

            this.promptElements.push ( promptTxt );

            var captionTxtConfig = {
                color : '#ffff00',
                fontSize : gW * 0.026,
                fontFamily : "Trebuchet MS",
                //fontStyle : 'bold'
            };

            var cx = tx,
                cy = withButtons ? gY + gH * 0.52 : gY + gH * 0.6;

            var captionTxt = this.add.text ( cx, cy, caption, captionTxtConfig).setOrigin(0.5).setDepth ( 999 );

            this.promptElements.push ( captionTxt );

        },
        showEndScreen : function () {

            this.playSound ('alternate');

            var txt = this.endWinner == 'self' ? 'Congrats! You win.' : 'Sorry, You lose.';

            var captionTxt = '';
            if ( this.playerResign ) {
                captionTxt = (this.endWinner == 'self' ) ? 'Opponent resigned.' : 'You resigned.';
            }

            this.showPrompt ( txt, captionTxt, true );

            var buts = ['Rematch', 'Quit'];

            var bW = config.width * 0.2
                bH = config.height * 0.065,
                bS = bW * 0.05,
                bT = buts.length * ( bW + bS ) - bS
                bX =  ( config.width - bT )/2 + (bW/2),
                bY =  config.height * 0.51 + (bH/2);

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede ).setDepth (999);

                btn.on ('pointerdown', function() {

                    this.change (0x00ffff);

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
                    this.change ();
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

            this.showPrompt ( 'Are you sure you want to resign?', '', true, 0.04 );

            var buts = [ 'Confirm', 'Cancel'];

            var bW = config.width * 0.2
                bH = config.height * 0.065,
                bS = bW * 0.05,
                bT = buts.length * ( bW + bS ) - bS
                bX =  ( config.width - bT )/2 + (bW/2),
                bY =  config.height * 0.51 + (bH/2);

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede ).setDepth(999);

                btn.on ('pointerdown', function() {

                    this.change (0x00ffff);

                    _this.playSound('clicka');
                    
                    switch ( this.id ) {
                        case 'but0' : 

                            _this.clearPrompt();
                            _this.playerResign = true;
                            _this.endGame ('oppo');
                            
                            if ( !_this.isSinglePlayer ) socket.emit ('playerResign');
                           
                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change ();
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

            this.showPrompt ( 'Are you sure you want to reveal your pieces?', '', true, 0.04 );

            var buts = [ 'Confirm', 'Cancel' ];

            var bW = config.width * 0.2
                bH = config.height * 0.065,
                bS = bW * 0.05,
                bT = buts.length * ( bW + bS ) - bS
                bX =  ( config.width - bT )/2 + (bW/2),
                bY =  config.height * 0.51 + (bH/2);

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede ).setDepth(999);

                btn.on ('pointerdown', function() {

                    this.change (0x00ffff);

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

                            if ( !this.isSinglePlayer ) socket.emit ('piecesReveal');

                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                                
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change ();
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

            this.showPrompt ( 'Are you sure you want to propose a draw?', '', true, 0.04 );

            var buts = [ 'Confirm', 'Cancel' ];

            var bW = config.width * 0.2
                bH = config.height * 0.065,
                bS = bW * 0.05,
                bT = buts.length * ( bW + bS ) - bS
                bX =  ( config.width - bT )/2 + (bW/2),
                bY =  config.height * 0.51 + (bH/2);
                
            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede ).setDepth (999);

                btn.on ('pointerdown', function() {
                    this.change (0x0ffff);

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
                    this.change ();
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

            this.showPrompt ( 'You can only propose draw on your turn', '', false, 0.04 );

            clearTimeout ( this.timeDissolve );

            var _this = this;

            this.timeDissolve = setTimeout ( function () {

                _this.clearPrompt();

            }, 1000 );

        },
        showWaitResponse : function () {

            this.showPrompt ('Waiting for response..', '', false, 0.04 );
        },
        showLeaveScreen : function () {

            this.showPrompt ( 'Are you sure you want to leave the game?', '', true, 0.04 );

            var buts = [ 'Confirm', 'Cancel' ];

            var bW = config.width * 0.2
                bH = config.height * 0.065,
                bS = bW * 0.05,
                bT = buts.length * ( bW + bS ) - bS
                bX =  ( config.width - bT )/2 + (bW/2),
                bY =  config.height * 0.51 + (bH/2);

            var _this = this;

            for ( var i = 0; i< buts.length; i++) {
                var btn = new MyButton ( this, 'but' + i, bX + i*(bW + bS), bY, bW, bH, buts[i], 0xdedede ).setDepth (999);

                btn.on ('pointerdown', function() {
                    this.change (0x00ffff);

                    _this.playSound('clicka');

                    switch ( this.id ) {
                        case 'but0' : 

                            _this.clearPrompt();
                            _this.leaveGame();

                        break;
                        case 'but1' : 
                            _this.clearPrompt();
                            _this.controls [4].setInteractive();
                        break;
                        default:
                    }
                    
                });
                btn.on ('pointerover', function() {
                    this.change ();
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
            this.playerResign = false;

            var _this = this;

            this.presetIndex = Math.floor ( Math.floor(Math.random()*6) );;

            var postArr = this.presetPost ( this.presetIndex );

            setTimeout ( function () {

                _this.createGamePiecesData ('self', postArr );

                _this.createGamePieces('self');

                _this.startPreparations()

                _this.createButtons();

            }, 500);
            
        },
        clearPrompt: function () {

            this.isPrompted = false;

            for ( var i in this.promptElements ) {
                this.promptElements[i].destroy();
            }
            for ( var i in this.buttonPanel ) {
                this.buttonPanel[i].destroy();
            }
            clearTimeout ( this.timeDissolve );

           
            for ( var i in this.button ) {
                if ( !this.button[i].isDisabled ) {
                    this.button[i].setInteractive();
                }
            }

            this.controls [4].setInteractive();

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

            socket.emit ('leaveGame');

            socket.removeAllListeners();

            this.bgmusic.stop();

            this.scene.start('Intro');
           

        },
        
    });

    //..GamePiece...
    var GamePiece =  new Phaser.Class({

        Extends: Phaser.GameObjects.Container,

        initialize:

        function GamePiece ( scene, id, x, y, width, height, rnk, type, post, plyr, cnt, active=false )
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
            this.post = post;
            this.cnt = cnt;
            this.activated = false;
            this.origin = plyr == 'self' ? 'bot' : 'top';
            this.isDestroyed = false;
            this.bgColor = type == 0 ? 0xffffff : 0x000000;

            this.shape = scene.add.graphics ( { fillStyle: { color: this.bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            this.shape.fillRoundedRect ( -width/2, -height/2, width, height, height * 0.1);
            this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, height * 0.1);

            var txtConfig = { 
                fontFamily: 'Trebuchet MS', 
                fontSize: Math.floor(height * 0.21), 
                color: type == 0 ? '#000' : '#fff' 
            };

            var top = -height/2,
                left = -width/2;

            var imgSize = width * 0.5;

            var indx = type == 0 ? 15 : 16;

            this.image = scene.add.image ( 0, top + height * 0.4, 'thumbs', indx ).setScale ( imgSize/50 )

            this.txt = scene.add.text ( 0, top + height * 0.8, '···', txtConfig ).setOrigin(0.5);

            this.add ([this.shape, this.image, this.txt]);

            scene.children.add ( this );
            
        },

        change : function ( clr ) {

            this.shape.clear();
            this.shape.fillStyle( clr, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height*0.1);
            
        },
        activate : function () {

            var clr = this.type == 0 ? 0xd5d5d5 : 0x2a2a2a;

            this.change ( clr );

            this.activated = true;

        },
        reset : function () {

            var clr = this.type == 0 ? 0xffffff : 0x000000;

            this.change ( clr );

            this.activated = false;
        },
        flip: function () {

            var ranks = ['General','General','General','General','General','Colonel','Lt. Colonel','Major', 'Captain', '1st Lt.','2nd Lt.','Sergeant','Private','Flag','Spy'];

            if ( this.rnk > 0 ) {
                
                this.image.setFrame (this.rnk - 1);

                //this.txt.text = ranks[this.rnk - 1];

                this.txt.text = this.id;
                
            }

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
            this.isClicked = false;
            this.bgColor = bgColor;
            this.txtClr = '#0a0a0a';
            this.isDisabled = false;
            
            this.roundCorners = this.height *0.2;

            this.shape = scene.add.graphics ( { fillStyle: { color: bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            this.shape.fillRoundedRect ( -width/2, -height/2, width, height, this.roundCorners);
            this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, this.roundCorners);

            var txtConfig = { 
                fontFamily: 'Trebuchet MS', 
                fontStyle : 'bold',
                fontSize: Math.floor(height * 0.38 ), 
                color: '#000' 
            };

            this.text = scene.add.text ( 0, 0, text, txtConfig ).setOrigin(0.5);

            //add to container...
            this.add ([this.shape, this.text]);

            scene.children.add ( this );

        },

        change : function ( clr = 0xb3d9ff, txtClr = '#0a0a0a' ) {

            this.shape.clear();
            this.shape.fillStyle( clr, 1);
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.roundCorners);

            this.text.setColor ( txtClr );
            
        },
        disabled : function () {
            
            this.isDisabled = true;

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

            this.text.setColor ( this.txtClr );

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

        function PlayerIndicator ( scene, id, x, y, width, height, name, max, bgColor = 0xf5f5f5 )
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
            this.bgColor = bgColor

            this.shape = scene.add.graphics ( { fillStyle: { color: bgColor,  alpha: 1 }, lineStyle : { color: 0xa4a4a4, width:1 } });

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
        offTimer :  function ( caption ) {
            
            this.bar.destroy();

            this.timertxt.setVisible ( false );

            this.caption.setPosition ( this.width * 0.46, -this.height * 0.08 );

            this.caption.text = caption; //'· Your Turn';

        },
        setTimer : function ( maxTime, caption ) {

            this.maxTime = maxTime;

            var fin = ( maxTime < 10 ) ? '0' + maxTime : maxTime;

            this.timertxt.setText ( '00:00:' + fin );

            this.caption.text = caption;  // '· Your Turn';

            var bH = this.height * 0.6,
                bW = this.width * 0.015;
        
            var top = -this.height/2,
                left = -this.width/2;

            this.bar.fillStyle ( 0x00ff33, 1);

            this.bar.fillRect ( left + this.width * 0.94, top + this.height * 0.8 - bH, bW, bH );

        },
        clearTimer : function () {

            this.timertxt.text = '';

            this.caption.text = '';

            this.bar.clear();

            this.change ( this.bgColor );

        },
        updateWins : function ( winCount ) {

            this.winCount = winCount;

            this.winTxt.setText ( '✪ Wins : ' + winCount);
        
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
            
            this.change ( this.bgColor );

            this.image.setFrame ( 18 );
            
        },
        ready : function () {

            this.change ( 0x66ffcc );

            this.caption.text = '· Ready';

        },
        change : function ( clr ) {

            this.shape.clear();
            this.shape.fillStyle  ( clr, 1 );
            this.shape.fillRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height * 0.15);
            this.shape.strokeRoundedRect ( -this.width/2, -this.height/2, this.width, this.height, this.height * 0.15);
        },

    });

}
    