
/*  
//Author : Charlou E. Nicolas 
*/

window.onload = function () {

    var game, config, socket;

    var _gameW = 0, _gameH = 0;


    var username = document.getElementById('username');

    username.value = 'Player' + Math.floor( Math.random() * 99999 );

    var btn = document.getElementById ('btnEnter');    

    var form = document.getElementById ('myForm');

    form.onsubmit = function ( e ) {

        e.preventDefault();

        document.getElementById('game_login').style.display = 'none';
        document.getElementById('game_div').style.display = 'block';
        
        enterGame ();
        
    }

    readDeviceOrientation();

    this.addEventListener("orientationchange", function() {
        readDeviceOrientation()
    });

    function readDeviceOrientation () {


        if ( window.orientation == undefined  ) return;

        var landscape = Math.abs ( window.orientation) == 0;

        var btn_enter =  document.getElementById('btnEnter');

        btn_enter.disabled = ( landscape ) ? true : false; 

        var message_div =  document.getElementById('messageDiv');

        message_div.innerHTML = ( !landscape ) ? '' : '<small>Please set device orientation to landscape.</small>';

    }

    function enterGame () {

        var maxW = 1280;

        var container = document.getElementById('game_container');

        var contW = container.clientWidth,
            contH = container.clientHeight;

        var tmpWidth = contW > maxW ? maxW : contW,
            tmpHeight = Math.ceil(tmpWidth * 9/16);

        if ( tmpHeight >= contH ) {

            gameH = contH;
            gameW = Math.ceil(gameH * 16/9);
            //console.log ( 'game dimensions adjusted by screen height' )

        }else {

            gameW = tmpWidth;
            gameH = tmpHeight;
            //console.log ( 'game dimensions adjusted by screen width' )
        }

        _gameW = gameW;
        _gameH = gameH;
        
        var game_div = document.getElementById('game_div');
        game_div.style.width = gameW + 'px';
        game_div.style.height = gameH + 'px';
     

        config = {

            type: Phaser.AUTO,
            width: gameW,
            height: gameH,
            backgroundColor: '#dedede',
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

    //Scenes..
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

            this.load.audio('introbg', ['client/assets/sfx/drumsofwar.ogg', 'client/assets/sfx/drumsofwar.mp3']);

            this.load.audio('bgsound', ['client/assets/sfx/siege.ogg', 'client/assets/sfx/siege.mp3']);

            this.load.audio('clocktick', ['client/assets/sfx/tick.ogg', 'client/assets/sfx/tick.mp3']);

            this.load.image('bg', 'client/assets/images/intro/background.jpg');
            this.load.image('lines', 'client/assets/images/intro/lines.png');
            this.load.image('title', 'client/assets/images/intro/title.png');
            this.load.image('star', 'client/assets/images/intro/star.png');
            this.load.image('select', 'client/assets/images/intro/select.png');
            this.load.image('avatar_placement', 'client/assets/images/intro/avatar_placement.png');

           
            this.load.spritesheet('radio', 'client/assets/images/intro/radio_btns.png', { frameWidth: 45, frameHeight: 45 });
            this.load.spritesheet('start', 'client/assets/images/intro/start_btn.png', { frameWidth: 528, frameHeight: 93 });

            this.load.spritesheet('thumbs', 'client/assets/images/thumbs.png', { frameWidth: 50, frameHeight: 50 });

            //....
            this.load.image('pairing_placement', 'client/assets/images/intro/pairing_placement.png');
            this.load.spritesheet('keys', 'client/assets/images/intro/keyboardBtns.png', { frameWidth: 85, frameHeight: 85 });

            //...
            this.load.image('prompt', 'client/assets/images/intro/prompt.png');
            this.load.image('invite', 'client/assets/images/intro/invite.png');
            this.load.spritesheet('prompt_btns', 'client/assets/images/intro/prompt_btns.png', { frameWidth: 224, frameHeight: 58 });

            this.load.image('circ0', 'client/assets/images/waiting/circ0.png');
            this.load.image('circ1', 'client/assets/images/waiting/circ1.png');
            this.load.image('circ2', 'client/assets/images/waiting/circ2.png');
            //..

            this.load.image('bg2', 'client/assets/images/proper/bg.png');
            this.load.image('elim_field', 'client/assets/images/proper/elim_field.png');
            this.load.image('send_emoji', 'client/assets/images/proper/send_emoji.png');
            
            this.load.image('prompt_big', 'client/assets/images/proper/prompt_big.png');
            this.load.image('prompt_small', 'client/assets/images/proper/prompt_small.png');
            this.load.image('commence', 'client/assets/images/proper/commence.png');
            this.load.image('commence_w', 'client/assets/images/proper/commence_w.png');

            this.load.spritesheet('piece', 'client/assets/images/proper/pieces.png', { frameWidth: 125, frameHeight: 74 });
            this.load.spritesheet('cont_btns', 'client/assets/images/proper/cont_btns.png', { frameWidth: 45, frameHeight: 45 });
            this.load.spritesheet('indicatorbg', 'client/assets/images/proper/indicator.png', { frameWidth: 557, frameHeight: 71 });
            this.load.spritesheet('prompt_btns2', 'client/assets/images/proper/prompt_btns.png', { frameWidth: 197, frameHeight: 62 });
            this.load.spritesheet('emojis', 'client/assets/images/proper/emojis.png', { frameWidth: 100, frameHeight: 100 });
            

            var txtH = Math.floor ( 30 * _gameH/720 );

            var txtConfig = { 
                color : '#3a3a3a', 
                fontSize : txtH,
                fontFamily : 'Impact'
            }

            this.loadtxt = this.add.text ( _gameW/2, _gameH/2, 'Loading Game Files...',  txtConfig ).setOrigin(0.5);


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

            this.gameData = {
                'game' : 0,
                'type' : 0
            }

            this.loadtxt.destroy();

            this.isSetGame = false;

            this.initSound ();

            this.initSocketIOListeners();
            
            this.initGameInterface ();

            setTimeout ( function () {
                socket.emit ('getInitData');
            }, 500 ); 
            
        },
        initSocketIOListeners () {

            //console.log ('listeners loaded');

            var _this = this;

            socket.on ('pairInvite', function ( data ) {
                
                if ( _this.connectScreenShown ) _this.removeConnectScreen();

                setTimeout ( function () {
                    _this.showInviteScreen ( data );
                }, 100 );
                
            });

            socket.on ('pairingError', function ( data ) {
            
                if ( _this.isPrompted ) _this.removePrompt ();

                var err = "";

                if ( data.error == 0 ) {
                    err = 'Pairing unsuccessful.';
                }else if ( data.error == 1 ) {
                    err = 'Pairing ID error.';
                }else {
                    err = 'Game does not exist anymore.';
                }

                _this.showPromptScreen ( 'error', err );

            
            });

            socket.on ('sendInitData', function ( data ) {

                _this.music.play ('message');

                _this.playersID.text = 'Pairing ID : ' + data.pid;

                _this.playersOnlineTxt.text = 'Players Online : ' + data.count;
            });

            socket.on ('initGame', function ( data ) {
                _this.isSetGame = true;
                setTimeout ( function () {
                    _this.initGame (data);
                }, 300 );
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
        initGameInterface  : function () {

            var background = this.add.image (0, 0, 'bg' ).setOrigin ( 0 ).setScale(_gameW/1280);
            var lines = this.add.image (0, 0, 'lines' ).setOrigin ( 0 ).setScale(_gameW/1280);
            var title = this.add.image (0, - (_gameH * 0.26), 'title' ).setOrigin ( 0 ).setScale(_gameW/1280).setAlpha (0);

            this.tweens.add ({
                targets : title,
                y :  0,
                alpha : 1,
                duration : 1000,
                easeParams : [0.5, 1.5],
                ease : 'Bounce'
            });

            //avatar
            var avatar_plt = this.add.image ( _gameW*0.029, _gameH*0.029, 'avatar_placement' ).setOrigin ( 0 ).setScale(_gameW/1280);
            
            var avatar_img = this.add.image ( _gameW*0.029, _gameH*0.045, 'thumbs', 18  ).setOrigin ( 0 ).setScale(_gameW/1280);

            var playerName = this.add.text ( _gameW*0.075, _gameH*0.042, username.value, { color : '#7f6868', fontFamily : 'Impact', fontSize: _gameH*0.035 } ).setOrigin(0);
    
            this.playersID = this.add.text ( _gameW*0.075, _gameH*0.087, "Pairing ID : ---", { color : '#b78d8d', fontFamily : 'Impact', fontSize: _gameH*0.025 } ).setOrigin(0);
    
            this.playersOnlineTxt = this.add.text ( _gameW*0.033, _gameH*0.145, "Players Online : -", { color : '#b5a9a0', fontFamily : 'Impact', fontSize: _gameH*0.025 } ).setOrigin(0);
            

            //stars...

            var strSize = _gameW * 0.052, strCount = 5;
            
            var xSpacing = _gameW * 0.008,
                xStart =  (_gameW - ((( strSize + xSpacing ) * strCount )-xSpacing))/2;

            for ( var i = 0; i < strCount; i++ ) {

                var image4 = this.add.image ( _gameW*0.078, _gameH*0.29, 'star' ).setOrigin ( 0 ).setScale(_gameW/1280).setAlpha (0);

                this.tweens.add ({
                    targets : image4,
                    x : xStart + ( (4-i) * ( strSize + xSpacing ) ),
                    alpha : 1,
                    duration : 300,
                    delay : (i * 100) + 1000,
                    ease : 'Power3'
                });
                
            }   

            //select....
            var select_img = this.add.image ( _gameW, 0, 'select' ).setOrigin ( 0 ).setScale(_gameW/1280);
            
            var _this = this;

            this.tweens.add ({
                targets : select_img,
                x : 0,
                ease : 'Power2',
                duration : 300,
                onComplete : function () {
                    _this.showSelect();
                }
            });

        },
        showSelect : function () {

            var _this = this;

            var btxa = Math.floor ( 360 * _gameW/1280 ),
                btxb = Math.floor ( 665 * _gameW/1280 ),
                bty =  Math.floor ( 385 * _gameH/720 ),
                bts = Math.floor ( 45 * _gameW/1280 );
                
            var textNameConfig = { 
                color:'#5e5e5e', 
                fontSize: bts * 0.48,
                fontFamily : 'Impact'
            };
    
            var textName = this.add.text ( _gameW *0.525, _gameH*0.685, "◉ No Timer", { color : '#6e4545', fontSize : bts * 0.42, fontFamily : 'Impact'} ).setOrigin(0);
    
            var btw = Math.floor ( 260 * _gameW/1280 ),
                btsp = bts * 0.1;

            var textArr = ['vs Computer', 'vs Random Opponent' , 'vs Online Friend'];

            var sizeRad = 45 * (_gameW/1280);

            this.radios = [];

            this.under = [];


            for ( var i = 0; i<3; i++ ) {

                var xa = btxa,
                    ya = bty + i * ( bts + btsp );

                var rectDiv = this.add.rectangle ( xa, ya, btw, bts, 0xdedede, 0 ).setOrigin(0).setData ('id', i).setInteractive();
            
                rectDiv.on('pointerdown', function () {

                    var curGame = _this.gameData.game;

                    _this.radios [curGame].setFrame (0);
                    
                    _this.under [curGame].setAlpha (0);

                    var data1 = this.getData('id');

                    _this.radios[data1].setFrame (1);

                    //_this.under[data1].setAlpha (1);
                    _this.under[data1].width = 0;

                    _this.tweens.add ({
                        targets : _this.under[data1],
                        alpha : 1,
                        width : btw * 0.87,
                        ease : 'Power2',
                        duration : 150
                    });

                    _this.gameData.game = data1;

                    _this.music.play ('clickc');
                    
                });


            
                var frame = i==0 ? 1 : 0;

                var under_rect = this.add.rectangle (  xa + sizeRad/2, ya + sizeRad/2, btw * 0.87, bts * 0.7, 0xcccccc, 1 ).setOrigin (0, 0.5).setAlpha(frame);

                var radion_btns = this.add.image ( xa + sizeRad/2, ya + sizeRad/2, 'radio', frame ).setScale ( _gameW/1280 ).setAlpha(1);

                var txt_btns = this.add.text ( xa + sizeRad*1.2, ya + sizeRad/2, textArr[i], textNameConfig).setOrigin (0, 0.5).setAlpha(1);

                this.radios.push (radion_btns);

                this.under.push (under_rect);


            }

            var textArra = ['Classic', 'Blitz'];

            for ( var i = 0; i<2; i++ ) {
                

                var xb = btxb,
                    yb = bty + i * ( bts + btsp );

                var rectDivb = this.add.rectangle ( btxb, bty + i * ( bts + btsp ) , btw, bts, 0xdedede, 0 ).setOrigin(0).setData ('id', i).setInteractive();

                rectDivb.on('pointerdown', function () {

                    var curGameb = _this.gameData.type;
                    _this.radios [curGameb + 3].setFrame (0);
                    _this.under [curGameb + 3].setAlpha (0);

                    var data2 = this.getData('id');
                
                    _this.under[data2 + 3 ].width = 0;

                    _this.tweens.add ({
                        targets : _this.under[data2 + 3],
                        alpha : 1,
                        width : btw * 0.87,
                        ease : 'Power2',
                        duration : 150
                    });

                    textName.text = data2 == 0 ? '◉ No Timer' : '◉ 30 secs prep, 15 secs turn';

                    _this.radios [data2 + 3].setFrame (1);

                    _this.music.play ('clickc');

                    _this.gameData.type = data2;
                    

                });


                var frameb = i==0 ? 1 : 0;

                var under_recta = this.add.rectangle (  xb + sizeRad/2, yb + sizeRad/2, btw * 0.87, bts * 0.7, 0xcccccc, 1 ).setOrigin (0, 0.5).setAlpha(frameb);

                var radion_btnsa = this.add.image ( xb + sizeRad/2, yb + sizeRad/2, 'radio', frameb ).setScale ( _gameW/1280 ).setAlpha(1);

                var txt_btnsa = this.add.text ( xb + sizeRad*1.2, yb + sizeRad/2, textArra[i], textNameConfig).setOrigin (0, 0.5).setAlpha(1);

                this.radios.push ( radion_btnsa );

                this.under.push (under_recta);

            }
     
            setTimeout (function () {
                _this.showStartBtn ();
            }, 2000)
            
            
        },
        showStartBtn : function () {

            var _this = this;

            this.music.play ('move');

            var bh = Math.floor(523 * _gameH/720);

            var start_btn = this.add.image ( _gameW/2, _gameH + (bh), 'start', 0 ).setInteractive().setScale(_gameW/1280);

            this.tweens.add ({
                targets : start_btn,
                y :  _gameH*0.864,
                alpha : 1,
                duration : 400,
                easeParams : [ 1, 0.5 ],
                ease : 'Quad.easeOut'
            });

            start_btn.on ('pointerout', function () {
                this.setFrame (0)
            });
            start_btn.on ('pointerup', function () {
                this.setFrame (0)
            });
            start_btn.on ('pointerover', function () {
                this.setFrame (1)
                //_this.music.play ('move');
            });
            start_btn.on ('pointerdown', function () {

                //this.setFrame (2);
                _this.music.play ('clicka');

                var toSendData = {
                    'isSinglePlayer' : _this.gameData.game == 0,
                    'isChoosingOpponent' : _this.gameData.game == 2,
                    'isTimed' : _this.gameData.type == 1
                }


                if ( _this.gameData.game == 0 ) {

                    socket.emit ('enterGame', toSendData );

                    _this.showWaitScreen ();

                    
                }else if ( _this.gameData.game == 1 ) {
                    
                    socket.emit ('enterGame', toSendData );

                     _this.showPromptScreen ( 'connect' );
                    //_this.scene.add('Pair', Pair, true);
                }else {

                    _this.showConnectToFriendScreen();
                    //_this.scene.add('Connect', Connect, true,{err : 3});
                }
                

            });

        },
        createFakeData : function ( len ) {
            
            var tmp = [];
            for ( var i=0; i<len; i++) {

                var rand = Phaser.Math.Between ( 1000, 9999 );

                tmp.push ({ name: 'Player' + rand, 'id' : 'asdf-asdf-asdf-1001' });
            }
            return tmp;
        },
        disableButtons : function ( disabled = true ) {

            if ( disabled ) {
                for ( var i in this.selectBtns ) {
                    this.selectBtns[i].removeInteractive();
                }
            }else {
                for ( var i in this.selectBtns ) {
                    this.selectBtns[i].setInteractive();
                }
            }

        },
        showWaitScreen : function () {

            var _this = this;

            this.isPrompted = true;

            this.rectBg = this.add.rectangle ( 0, 0, _gameW, _gameH, 0x000000, 0.7 ).setOrigin(0).setInteractive();

            this.promptScreen = this.add.container (0, _gameH/2).setDepth(999);

            var window = this.add.image ( 0, 0, 'prompt' ).setOrigin ( 0 ).setScale( _gameW/1280 );

            var yp = Math.floor ( 326 * _gameH/720 );

           
            var img0 = this.add.image ( _gameW/2, yp, 'circ0' ).setScale( _gameW/1280 ).setRotation ( Math.PI/180 * (Math.random() * 360) );

            var img1 = this.add.image ( _gameW/2, yp, 'circ1' ).setScale( _gameW/1280 ).setRotation ( Math.PI/180 * (Math.random() * 360 ));;

            var img2 = this.add.image ( _gameW/2, yp, 'circ2' ).setScale( _gameW/1280 ).setRotation ( Math.PI/180 * (Math.random() * 360) );;

            var txtConfig = { 
                color:'#dedede', 
                fontSize: Math.floor ( 30 * _gameH/720 ),
                fontFamily : 'Impact'
            };

            var rW = Math.floor ( 320 * _gameW/1280 ),
                rH = Math.floor ( 45 * _gameH/720);

            var rectF = this.add.rectangle ( _gameW/2, yp, rW, rH, 0x3a3a3a, 0.5 );

            var txt = this.add.text ( _gameW/2, yp, 'Connecting..', txtConfig ).setOrigin(0.5);


            this.promptScreen.add ([window, img0, img1, img2, rectF, txt ]);

           
            this.tweens.add ({
                targets : img0,
                duration : 3000,
                rotation : '+=10',
                repeat : -1,
                yoyo : true,
                ease : 'Quad.easeIn'
            });
            this.tweens.add ({
                targets : img1,
                duration : 3000,
                rotation : '-=8',
                repeat : -1,
                yoyo : true,
                ease : 'Quad.easeIn'
            });
            this.tweens.add ({
                targets : img2,
                duration : 3000,
                rotation : '+=5',
                repeat : -1,
                yoyo : true,
                ease : 'Quad.easeIn'
            });

            this.tweens.add ({
                targets : this.promptScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });



        },
        showPromptScreen : function ( promptType, err='' ) {

            var _this = this;

            this.isPrompted = true;

            this.rectBg = this.add.rectangle ( 0, 0, _gameW, _gameH, 0x000000, 0.7 ).setOrigin(0).setInteractive();

            this.promptScreen = this.add.container (0, _gameH/2).setDepth(999);

            //476 x 225 

            var window = this.add.image ( 0, 0, 'prompt' ).setOrigin ( 0 ).setScale( _gameW/1280 );

            var bx = _gameW/2,
                by = _gameH * 0.525;

            var txtx = _gameW/2,
                txty = _gameH * 0.385,
                txtH = Math.floor ( 32 * _gameH/720 );

            var str = ( promptType == 'connect') ? 'Connecting..' : err ;

            var txtConfig = { 
                color:'#746a62', 
                fontSize: txtH,
                fontFamily : 'Impact'
            };

            var txt = this.add.text ( txtx, txty, str, txtConfig ).setOrigin(0.5);

            this.promptScreen.add ([window, txt]);

            var btn_id = "", frame = 0;

            if ( promptType == 'connect')
            {
                var max = 5;

                var bSize = Math.floor ( 25 * _gameW/1280 ),
                    bSpace = Math.floor ( 3 * _gameW/1280 ),
                    bTotal = max * ( bSize + bSpace ) - bSpace;
                    cX = (_gameW - bTotal) /2,
                    cY = _gameH * 0.45;

                    
                var duration = 500, delay = duration/max;

                for ( var i=0; i<max; i++) {

                    var circ = this.add.circle ( cX + ( i*( bSize + bSpace) ) + (bSize/2), cY, bSize/2, 0x6c6c6c, 1 );
            
                    this.tweens.add ({
                        targets : circ,
                        scaleX : 0.5,
                        scaleY : 0.5,
                        duration : duration,
                        ease : 'Power2',
                        repeat : -1,
                        yoyo : true,
                        delay : i * delay,
                    });

                    this.promptScreen.add (circ);

                }
                
                btn_id = 'cancel';
                btn_fr = 0;

            }else {

                btn_id = 'confirm';
                btn_fr = 2;

            }        

            var btn = this.add.image ( bx, by, 'prompt_btns', btn_fr ).setScale( _gameW/1280 ).setData({'frame': btn_fr, 'id' : btn_id}).setOrigin(0.5).setInteractive();
    
            btn.on('pointerover', function () {
                this.setFrame ( this.getData('frame') + 1 );
            });
            btn.on('pointerout', function () {
                this.setFrame ( this.getData('frame')  );
            });
            btn.on('pointerdown', function () {
                
                if ( _this.isSetGame ) return;

                if ( this.getData('id') == 'cancel') socket.emit ('leaveGame');

                _this.music.play ('clicka');

                _this.removePrompt ();

            });
            this.promptScreen.add (btn);

            this.tweens.add ({
                targets : this.promptScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });

        },
        showInviteScreen : function ( data ) {

            var _this = this;

            this.isPrompted = true;

            this.rectBg = this.add.rectangle ( 0, 0, _gameW, _gameH, 0x000000, 0.7 ).setOrigin(0).setInteractive();

            this.promptScreen = this.add.container (0, _gameH/2).setDepth(999);

            var window = this.add.image ( 0, 0, 'invite' ).setScale(_gameW/1280).setOrigin ( 0 );
            
            var txtH = Math.floor ( 28 * _gameW/1280 ),
                txtX = Math.floor ( 640 * _gameW/1280 ),
                txtY = Math.floor ( 265 * _gameH/720 );

            var textNameConfig = { 
                color:'#9c5825', 
                fontSize: txtH,
                fontFamily : 'Impact'
            };
            
            var gameType = data.isTimed ? 'Blitz' : 'Classic';

            var str = data.invite + ' has Invited you to a "'+ gameType +'" game.';

            var textName = this.add.text ( txtX, txtY, str, textNameConfig ).setOrigin(0.5, 0);


            this.promptScreen.add ([ window, textName]);

            var dataArr = [{ id : 'accept', frame : 4 }, { id : 'reject', frame : 6 } ];

            var _this = this;
            
            var btw = Math.floor ( 224 * _gameW/1280 ),
                bts = btw * 0.1,
                btx = (_gameW - ((btw * 2) + bts))/2 + btw/2,
                bty = Math.floor ( 360 * _gameH/720 );
                
            for ( var i = 0; i < dataArr.length; i++ ) {

                var btn = this.add.image ( btx + i * (btw + bts), bty, 'prompt_btns', dataArr[i].frame ).setScale (_gameW/1280).setData ( dataArr[i] ).setInteractive();
                
                btn.on ('pointerdown', function() {
                    //_this.playSound('clicka');
                    //_this.promptBtnsClick ( this.getData('id') );
                    socket.emit ( 'pairingResponse',  this.getData('id') == 'accept' );

                    _this.music.play('clicka');

                    _this.removePrompt ();


                });
                btn.on ('pointerover', function() {
                    this.setFrame ( this.getData('frame') + 1 );
                });
                btn.on ('pointerup', function() {
                    this.setFrame ( this.getData('frame') );
                });
                btn.on ('pointerout', function() {
                    this.setFrame ( this.getData('frame'));
                });

                this.promptScreen.add ( btn );

            }

            this.tweens.add ({
                targets : this.promptScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });
            
            

            

        },
        showConnectToFriendScreen : function () {

            var _this = this;
            
            this.connectScreenShown = true;

            this.rectBg = this.add.rectangle ( 0, 0, _gameW, _gameH, 0x000000, 0.7 ).setOrigin(0).setInteractive();

            this.connectScreen = this.add.container (0,_gameH).setDepth (999);

            var rX = Math.floor ( 809 * _gameW/1280 ),
                rY = Math.floor ( 122 * _gameH/720 ),
                rz = Math.floor ( 62 * _gameW/1280 );

            var rectUnder = this.add.rectangle ( rX, rY, rz, rz ).setInteractive();

            rectUnder.on ('pointerdown', function () {
                
                _this.music.play ('clicka');
                _this.removeConnectScreen ();

            });


            var window = this.add.image (0, 0, 'pairing_placement' ).setOrigin ( 0 ).setScale(_gameW/1280);

            var txtH = Math.floor ( 56 * _gameH/720 );
            var txtConfig = { 
                color:'#4e4e4e', 
                fontSize: txtH, 
                fontFamily:'Impact', 
            };

            var txtX = Math.floor ( 780 * _gameW/1280 ),
                txtY = Math.floor ( 182 * _gameH/720 );

            var txt = this.add.text (txtX, txtY, '0', txtConfig ).setOrigin (1, 0);

            this.connectScreen.add ([ rectUnder, window, txt ]);

            var inputCount = 0, maxInput = 6;

            var xW = Math.floor ( 105 * _gameW/1280 ),
                xH = Math.floor ( 83 * _gameW/1280 ),
                xSp = Math.floor ( 3 * _gameW/1280 ),

                xStart =  ((_gameW - ((3 * (xW + xSp)) - xSp))/2) + xW/2,
                //xStart =  Math.floor ( 482 * _gameW/1280 ),
                yStart =  Math.floor ( 305 * _gameW/1280 );

            var keysVal = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'clr', 'ok' ];

            for ( var i = 0; i < 12; i++ ) {

                var ix = Math.floor ( i/3 ), iy = i%3;

                var xs = xStart + iy * (xW + xSp),
                    ys = yStart + ix *( xH + xSp );

                var keys = this.add.image ( xs, ys, 'keys' ).setScale(_gameW/1280).setData('id', i).setInteractive();

                keys.on('pointerover', function () {
                    this.setFrame (1);
                });
                keys.on('pointerout', function () {
                    this.setFrame (0);
                });
                keys.on('pointerup', function () {
                    this.setFrame (0);
                });
                keys.on('pointerdown', function () {
                
                   this.setFrame (2);

                    var data = this.getData('id');

                    if ( data < 10 ) {

                        if ( inputCount < maxInput ) {

                            //this.setFrame ( data + 12 );

                            if ( inputCount == 0 ) txt.text = '';

                            if ( data == 9 ) {
                                txt.text += '0'
                            }else {
                                txt.text += (data + 1) ;
                            }
                           
                            inputCount++;

                            _this.music.play('clicka');


                        }else {
                            _this.music.play('error');
                        }


                    }else if ( data == 10 ) {

                        txt.text = '0';
                        inputCount = 0;
                        //this.setFrame ( this.getData('frame') + 12 );

                        _this.music.play('clicka');

                    }else {

                        if ( inputCount > 0 ) {

                            //this.setFrame ( this.getData('frame') + 12 );

                            _this.music.play('clicka');
                            
                            _this.removeConnectScreen ();

                            _this.showPromptScreen ('connect');

                            var isTimed = _this.gameData.type == 1;

                            socket.emit ('pair', { 'code' : txt.text, 'isTimed' : isTimed } );

                        }else {
                            _this.music.play('error');
                        }

                       
                        

                    }
                
                });

                //add texts..
                var txts = this.add.text ( xs, ys, keysVal[i], { color : '#3a3a3a', fontSize: xH * 0.4, fontFamily : 'Impact' }).setOrigin(0.5);

                this.connectScreen.add ( [keys, txts] );

            }

            this.tweens.add ({
                targets : this.connectScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });



        },
        removePrompt : function () {

            this.isPrompted = false;
            
            this.promptScreen.destroy ();
            
            this.rectBg.destroy();


        },
        removeConnectScreen : function () {

            this.connectScreenShown = false;

            this.connectScreen.destroy ();

            this.rectBg.destroy();
            
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
            this.buttonElements = [];
            this.buttonPanel = [];
            this.controls = [];

            this.messages = [];
            this.msgelements = [];
            this.elimPieces = [];

            this.player = {};
            this.plyrInd = {};
            this.gamePiece = {};

            this.gameData = {};
            
            this.gamePhase = '';
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
            this.isRead = false;
            this.playerResign = false;

            this.presetIndex = 0;

            this.maxPrepTime = data.prepTime;
            this.maxBlitzTime = data.blitzTime;
            
            this.soundOff = false;

            this.music;
            this.timer;
            this.timeDissolve;
            this.timeDissolveWarning;

            this.timerCount = 0;
            
        },
        preload: function (){
        },
        create: function () 
        {
            
            this.bg = this.add.image ( 0, 0, 'bg2' ).setScale(_gameW/1280 ).setOrigin(0);

            var _this = this;

            this.timer;

            this.gameWidth = config.width * 0.98;

            this.presetIndex = Math.floor ( Math.floor(Math.random()*6) );;

            var postArr = this.presetPost ( this.presetIndex );


            this.createGameData();

            this.createPlayers();

            this.createPlayerIndicator ();

            this.createGrid ();

            this.createGamePiecesData ('self', postArr );

            this.createGamePieces('self');

            this.initializeGameSounds();

            this.initSocketIOListeners();

            this.createControlPanel ();

            this.createButtons ();

            this.createGameControls();

            this.createElimPiecesScreen ();

            this.createSendEmojiScreen ();

            setTimeout ( function () {
                
                _this.makePreparations ();
        
            }, 800);

        },
        initSocketIOListeners : function () {

            var _this = this;

            socket.on ('drawResponse', function (data) {

                //console.log ( data );

                _this.removePrompt();

                _this.setOppoRanks ( data.oppoPieces );

                setTimeout ( function () {

                    if ( !data.accepted ) {
                        
                        if ( !data.plyrWhoResponded ) {
                            
                            _this.playSound ('message');

                            _this.showNotif ( 'Opponent declines. Game resumes.' );
                        }
                            
                        if ( _this.isTimed ) _this.startTimer ( _this.maxBlitzTime, _this.turn );
    
                    }else {
    
                        _this.playSound ('warp');
    
                        _this.endGame ();
                    }
                    
                }, 200 )


            });
            socket.on ('getDrawResponse', function () {

                if ( _this.timeIsTicking ) _this.stopTimer ();

                _this.showDrawResponseScreen();

            });
            socket.on ('showEmoji', function ( data ) {

                _this.showSendEmojiScreen (false);

                _this.playSound('message');

                _this.showSentEmojis ( data.frame, data.plyr );

            });
            socket.on ('opponentReveal', function ( data ) {

                for ( var i in data ) {

                    var piece = _this.gamePiece [ 'oppo_' + data[i].cnt ];

                    piece.rnk = data[i].rank;

                    piece.flip();

                }
                
                _this.playSound ('bleep');
                _this.plyrInd ['oppo'].updateStatus ();

            });
            socket.on ('resignResult', function ( data ) {

                _this.setOppoRanks ( data.oppoPieces );

                _this.playerResign = true;

                _this.endGame (data.winner);

            });
            socket.on ('moveResult', function ( data ) {

                //console.log ( data.isWinning );

                _this.isWinning = data.isWinning;

                if ( data.oppoPieces.length > 0) {

                    _this.setOppoRanks ( data.oppoPieces );

                }

                if ( data.clashResult == -1 ) {

                    _this.movePiece ( data.post, _this.turn );

                }else {

                    _this.clash ( data.post, data.clashResult );
                }

                _this.removeBlinkers();
                _this.removeActive ();

                if ( data.win ) {

                    if ( data.base ) _this.playSound ('home', 0.5);

                    _this.endGame ( data.isWinner );

                }else {
                    _this.switchTurn();
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

                if ( _this.isPrompted ) _this.removePrompt();

                clearInterval (_this.timer);

                _this.removeButtons ();
                _this.enabledPieces ('self', false );
                _this.enabledPieces ('oppo', false );
                _this.gamePhase = 'end';

                setTimeout(() => {
                    _this.showNotif ('Opponent has left the game.' );
                }, 200);
                
            });
            socket.on("resetGame", function () {
			
                if ( _this.isPrompted ) _this.removePrompt ();

                setTimeout (function () {
                    _this.resetGame();
                }, 200 )
                
            });
            socket.on ('commenceGame', function ( data ) {
                
                _this.turn = data.turn;

                _this.gameData['oppo'].pieces = data.oppoData;

                _this.createGamePieces ('oppo');

                _this.commenceGame ();

            });
            socket.on ('timeRanOut', function ( data ) {

                //console.log ( 'timeRanOut ');
                _this.playSound ('alarm');

                _this.playerTimeRanOut = true;

                if ( _this.gamePhase != 'end') _this.endGame ( data.winner );

                _this.plyrInd [ data.turn ].forceEnd ();

                _this.setOppoRanks ( data.oppoPieces );

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

            this.elimCountera = 0;
            this.elimCounterb = 0;
        },
        createPlayers : function () 
        {

            var oppNames = ['Rodrigo', 'Benigno', 'Gloria','Joseph', 'Fidel', 'Corazon', 'Ferdinand',
                            'Diosdado', 'Carlos',  'Ramon', 'Elpidio', 'Manuel R.', 'Sergio', 'Jose', 'Manuel Q.' ];

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
        createControlPanel : function () {

            //this.panel = this.add.image ( 0, 0, 'panel' ).setScale(_gameW/1280 ).setOrigin(0);

        },
        createGrid : function () {

            this.grid = [];

            var col = 9, row = 8;

            var btw = Math.floor ( 125 * _gameW/1280 ),
                bth = Math.floor ( 74 * _gameH/720 ),
                btx = Math.floor ( 78 * _gameW/1280 ),
                bty = Math.floor ( 99 * _gameH/720 );

            var strke = Math.floor ( 4 * _gameW/1280);

            for ( var i = 0; i < 72; i++ ) {

                var ix = Math.floor ( i/col ), iy = i%col;

                var clr = ( i < 36 ) ?  0xff0000 : 0x0033cc;

                var xp = btx + ( iy * btw ),
                    yp = bty + ( ix * bth );

                var rect = this.add.rectangle ( xp, yp, btw, bth, clr, 1 ).setOrigin (0).setStrokeStyle ( strke, 0xffffff );

                this.grid.push ({
                    x : xp + (btw/2), 
                    y : yp + (bth/2),
                    width : btw,
                    height : bth,
                    row  : ix,
                    col : iy,
                    cnt : i,
                    resident : '',
                    residentPlayer : ''
                });
            }

        },
        createPlayerIndicator: function () 
        {

            var btw = Math.floor ( 553 * _gameW/1280 ),
                bth = Math.floor ( 67 * _gameH/720 ),
                btxa = Math.floor ( 78 * _gameW/1280 ),
                btxb = Math.floor ( 651 * _gameW/1280 ),
                bty = Math.floor ( 18 * _gameH/720 );

            var self = new PlayerIndicator (this, 'self', btxa + btw/2, bty + bth/2, btw, bth, this.player['self'].name, 5 );

            this.plyrInd [ 'self' ] = self;

            var oppo = new PlayerIndicator (this, 'oppo', btxb + btw/2, bty + bth/2, btw, bth, this.player['oppo'].name, 5 );

            this.plyrInd [ 'oppo' ] = oppo;

            /* this.tweens.add ({
                targets : [self, oppo],
                y: bty,
                duration : 500,
                ease : 'Elastic',
                easeParams : [0.5, 1.1 ]
            }); */

        },
        createButtons : function ( proper = false ) {
            
            var buts = [];
            
            if ( !proper ) {
                buts = [
                    { id : 'preset', symbol : 'ℙ' },
                    { id : 'random', symbol : 'ℝ' }, 
                    { id : 'ready', symbol : '✺' }
                ];
            }else {
                buts = [
                    { id : 'draw', symbol : 'ⅅ' },
                    { id : 'resign', symbol : 'ℝ' }, 
                    { id : 'reveal', symbol : '❖' }
                ];
            }

            var btz = Math.floor ( 60 * _gameW/1280 ),
                bth = Math.floor ( 50 * _gameH/720 ),
                btx = _gameW - btz,
                bty = Math.floor ( 500 * _gameH/720 ),
                bts = bth * 0.08

            var _this = this;

            for ( var i = 0; i < buts.length; i++ ) {

                var xs = btx,
                    ys =  bty + (i*(bth + bts));

                var frame = !proper ? i*3 : (i*3)+9;
                

                //var but = new MyButton ( this, buts[i], xs, ys, btw, bth, frame, 'main_btns' ).setAlpha(0).setScale(0.1);

                var but = this.add.rectangle ( xs + btz, ys, btz, bth, 0x0a0a0a, 0.5 ).setOrigin (0).setData('id', buts[i].id ).setInteractive();

                var texta = this.add.text ( xs + (btz *1.5), ys + bth*0.7, buts[i].id , { color : '#ffc600', fontSize : bth * 0.22, fontFamily : 'Poppins' }).setOrigin (0.5);
              
                var textb = this.add.text ( xs + (btz *1.5), ys + bth*0.35, buts[i].symbol , { color : '#ffc600', fontSize : bth * 0.4, fontFamily : 'Poppins' }).setOrigin (0.5);

                but.on('pointerover', function () {
                    this.setFillStyle ( 0x0a0a0a, 1 );
                });
                but.on('pointerout',  function () {
                    this.setFillStyle ( 0x0a0a0a, 0.5 );
                });
                but.on('pointerup',  function () {
                    this.setFillStyle ( 0x0a0a0a, 0.5 );
                });
                but.on('pointerdown', function () {

                    if ( _this.isEmoji ) _this.toggleEmojis ();

                    if ( _this.elimScreenShown ) _this.toggleElimPiecesScreen();

                    switch (this.getData('id')) {

                        case 'preset' :

                            if ( _this.isTimed && _this.timerCount >= ( _this.maxPrepTime - 1) ) return;

                            //this.isDown();

                            _this.playSound('clicka');

                            _this.presetIndex += 1;
                            if ( _this.presetIndex > 5 ) {
                                _this.presetIndex = 0;
                            }
                            var pp = _this.presetPost( _this.presetIndex );
                            
                            _this.movePieces (pp);

                        break;

                        case 'random' :

                            if ( _this.isTimed && _this.timerCount >= (_this.maxPrepTime - 1) ) return;

                            //this.isDown();

                            _this.playSound('clicka');

                            var rp = _this.randomPost();
                            
                            _this.movePieces (rp);

                        break;
                       
                        case 'ready' :
                            
                            if ( _this.isTimed && _this.timerCount >= ( _this.maxPrepTime - 1) ) return;


                            //..
                            //this.isDown();

                            this.disableInteractive();

                            _this.playSound('clicka');

                            _this.playerReady();

                        break;
                        case 'resign' :
                            //..
                                
                            if ( _this.isTimed && _this.timerCount >= ( _this.maxBlitzTime - 1) ) return;

                            if ( _this.isPrompted ) {
                                
                                //this.isDown();

                                _this.playSound ('error');

                            }else {

                                //this.isDown();
                                
                                _this.playSound('clicka');

                                setTimeout ( function () {                        
                                    _this.showResignScreen();
                                }, 100);
                            }
                            

                        break;
                        case 'draw' :
                            //..
                            if ( _this.isTimed && _this.timerCount >= ( _this.maxBlitzTime - 1) ) return;

                            if ( _this.isPrompted ) {

                                //this.isDown();

                                _this.playSound ('error');

                            }else {

                                //this.isDown();
                                
                                _this.playSound('clicka');

                                setTimeout ( function () {     

                                    if ( _this.turn == 'self' ) {

                                        _this.showDrawScreen();

                                    } else {

                                        _this.showNotif ('You can only propose a draw on your turn.', 1500);
                                    }                
                                
                                }, 100);
                            }
                            
                        break;
                        case 'reveal' :
                            //..
                            if ( _this.isTimed && _this.timerCount >= ( _this.maxBlitzTime - 1) ) return;

                            if ( _this.isPrompted ) {

                                //this.isDown();

                                _this.playSound ('error');

                           }else {

                                //this.isDown();  

                                _this.playSound('clicka');

                                setTimeout ( function () {                        
                                    _this.showRevealScreen();
                                }, 100);
                                
                                
                            }
                            
                        break;
                        
                        default :
                    }

                });
                    
                this.tweens.add ({
                    targets : but,
                    x : xs,
                    duration : 200,
                    ease : 'Power2',
                    delay : (i * 100) + 1000,
                });

                this.tweens.add ({
                    targets : [texta, textb],
                    x : xs + btz/2,
                    duration : 200,
                    ease : 'Power2',
                    delay : (i * 100) + 1000,
                });

                this.buttonElements.push ( but );
                this.buttonElements.push ( texta );
                this.buttonElements.push ( textb );

            }

        },
        createGameControls: function () {

            var buts = ['elims', 'music', 'sound', 'emoji', 'close'];
            
            var btz = Math.floor ( 50 * _gameW/1280 ),
                btx = _gameW - btz,
                bty = Math.floor ( 105 * _gameH/720 ),
                bts = btz * 0.08;

            var _this = this;

            for ( var i = 0; i < buts.length; i++ ) {

                var xs = btx,
                    ys =  bty + (i*(btz + bts));

                //var frame = !proper ? i*3 : (i*3)+6;
                
                //var but = new MyButton ( this, buts[i], xs, ys, btw, bth, i, 'cont_btns' ).setAlpha(0).setScale(0);

                var but = this.add.rectangle ( xs + btz, ys, btz, btz, 0x0a0a0a, 0.5 ).setOrigin (0).setData('id', buts[i] ).setInteractive();

                var img = this.add.image ( xs + (btz *1.5), ys + btz/2, 'cont_btns', i ).setScale (_gameW/1280);

                but.on('pointerover', function () {
                    this.setFillStyle ( 0x0a0a0a, 1 );
                });
                but.on('pointerout',  function () {
                    this.setFillStyle ( 0x0a0a0a, 0.5 );
                });
                but.on('pointerup',  function () {
                    this.setFillStyle ( 0x0a0a0a, 0.5 );
                });
                but.on('pointerdown', function () {

                    this.setFillStyle ( 0x3a3a3a, 1 );
                    
                    _this.playSound('clicka');

                    switch (this.getData ('id')) {

                        case 'elims' :

                            _this.showElimPiecesScreen();
                            
                            break;

                        case 'music' :

                            if ( !_this.bgmusic.isPaused ) {
                                _this.bgmusic.pause();
                            }else {
                                _this.bgmusic.resume();
                            }
                            
                            break;
                       
                        case 'sound' :
                          
                            _this.soundOff = !_this.soundOff;

                            break;
                        case 'emoji' :
                           
                            _this.showSendEmojiScreen ();

                            break;

                        case 'close' :
                            
                            if ( _this.gamePhase != 'end' ) {
                                _this.showLeaveScreen();
                            }else{
                                _this.leaveGame ();
                            }

                            break;
                       
                        default :
                    }

                
                });
                    
                this.tweens.add ({
                    targets : but,
                    x : xs,
                    duration : 200,
                    ease : 'Power2',
                    delay : (i * 100) + 1000,
                });

                this.tweens.add ({
                    targets : img,
                    x : xs + btz/2,
                    duration : 200,
                    ease : 'Power2',
                    delay : (i * 100) + 1000,
                });

                this.controls.push ( but );

            }
            //...

        },
        showControlPanel : function ( show = true ) {

            var bgX = show ? 0 : -_gameW;

            var _this = this;

            this.toggle_btn.setFrame ( show ? 40 : 41 );

            this.tweens.add ({
                targets : this.panel,
                x : bgX,
                duration : 300,
                ease : 'Quad.easeOut',
                onComplete : function () {
                    _this.toggle_btn.setInteractive();
                }
            });

            for ( var i in this.button ) {
                
                var xs = show ? this.button [i].x + _gameW : this.button [i].x - _gameW;

                this.button [i].disableInteractive();

                this.tweens.add ({
                    targets : this.button [i],
                    x : xs,
                    duration : 300,
                    ease : 'Quad.easeOut',
                    onComplete : function () {
                        this.targets[0].setInteractive();
                    }
                });

            }
 
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

            //var active = ( plyr == 'self' ) ? true : false;

            var piecesData = this.gameData [plyr].pieces;

            var org = ( plyr == 'self' ) ? 67 : 4;

            var orgGrid = this.grid [ org ];

            var orgW = orgGrid.width,
                orgH = orgGrid.height;

            this.pieceDimensions = { 'width' : orgW, 'height' : orgH };

            for ( var i = 0; i < piecesData.length; i++ ) {

                var myPost = piecesData[i].post;

                var myGrid = this.grid [ myPost ];
        
                var gp = new GamePiece ( this, plyr +'_'+ i, orgGrid.x, orgGrid.y, orgW, orgH, piecesData[i].rank, type, myPost, plyr, i, false );
                
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
                        _this.playSound ('pick', 0.8 );

                    }

                    if ( _this.gamePhase == 'proper' &&  !_this.isSinglePlayer ) 
                        socket.emit ( 'pieceClick' , { 'active' : this.activated, 'cnt' : this.cnt } );

                });

                this.tweens.add ({

                    targets : gp,
                    x : myGrid.x,
                    y : myGrid.y,
                    duration : 200,
                    ease : 'Power2',
                    //easeParams : [ 0.5, 1.2 ],
                    delay : i * 5
                });
                
                if ( plyr == 'self' ) gp.flip();

                //gp.flip();

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

                            if ( _this.isTimed && _this.timerCount >= ( _this.maxPrepTime - 1) ) return;
                            
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

                if ( _this.isTimed && _this.timerCount >= ( _this.maxBlitzTime - 1) ) return;
                
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
        createSendEmojiScreen : function () {

            var _this = this;

            this.emojiSCreen = this.add.container ( 0, _gameH ).setSize ( _gameW, _gameH ).setDepth (9999);

            var bgClick = this.add.rectangle ( 0,0, _gameW, _gameH ).setOrigin (0).setInteractive ();

            bgClick.on ('pointerdown', function () {
                _this.playSound ('clickc');
                _this.showSendEmojiScreen( false );
            });

            var emojiWindow = this.add.image (0,0,'send_emoji').setOrigin(0).setScale(_gameW/1280 );
            
            this.emojiSCreen.add ([ bgClick, emojiWindow ]);

            var bts = Math.floor ( 70 * _gameW/1280 ),
                btx = Math.floor ( 760 * _gameW/1280 ),
                bty = Math.floor ( 164 * _gameH/720 );
                
            var emojiCount = 24;

            for ( var i = 0; i< emojiCount; i++ ) {

                var xp = Math.floor ( i/6 ), yp = i%6;

                var xpos = btx + ( yp * bts ) + bts/2,
                    ypos = bty + ( xp * bts ) + bts/2;

                var clicks = this.add.rectangle ( xpos, ypos, bts, bts, 0x0a0a0a, 0 );
                
                clicks.setInteractive().setDepth (9999).setData('count', i);

                clicks.on('pointerover', function () {
                    this.setFillStyle ( 0xffffff, 0.3 );

                });
                clicks.on('pointerout', function () {
                    this.setFillStyle ( 0xffffff, 0 );
                });
                clicks.on('pointerdown', function () {
                    
                
                    _this.showSendEmojiScreen (false);
                    
                    _this.playSound('message');

                    _this.removeEmojis();

                    if ( _this.isSinglePlayer ) {

                        _this.showSentEmojis ( this.getData('count') );

                        _this.autoRespond();

                    }else {

                        socket.emit ( 'playerSendEmoji', this.getData('count') );

                    }

                });
                
                var emoji = this.add.image ( xpos , ypos, 'emojis', i ).setScale(_gameW/1280 * 0.7 ).setDepth (9999);

                this.emojiSCreen.add ( clicks );
                this.emojiSCreen.add ( emoji );
                
            }

        },
        showSendEmojiScreen : function ( show = true) {

            if ( !show ) {
                this.emojiSCreen.y = _gameH 
            }else {
                //this.elimScreen.y = 0;
                this.tweens.add ({
                    targets : this.emojiSCreen,
                    y : 0,
                    duration : 300,
                    easeParams : [0, 1.5],
                    ease : 'Elastic'
                });
            }
            
        },
        createElimPiecesScreen : function () {

            var _this = this;

            this.elimScreen = this.add.container (0, _gameH).setSize(_gameW, _gameH).setDepth(9999);
            
            var screenWindow = this.add.image (_gameW/2, _gameH/2, 'elim_field').setScale(_gameW/1280).setInteractive();

            screenWindow.on ('pointerdown', function () {
                _this.playSound ('clickc');
                _this.showElimPiecesScreen (false);
            });

            this.elimScreen.add ( screenWindow );
            
            //this.elimScreen.y = _gameH;

 
        },
        showElimPiecesScreen : function ( show = true ) {

            if ( !show ) {
                this.elimScreen.y = _gameH 
            }else {
                //this.elimScreen.y = 0;
                this.tweens.add ({
                    targets : this.elimScreen,
                    y : 0,
                    duration : 300,
                    easeParams : [0, 1.5],
                    ease : 'Elastic'
                });
            }

            //this.elimScreen.setVisible (show);

            
        },
        positionElimPieces : function ( ids ) {

            var stxa = Math.floor ( 115 * _gameW/1280 ),
                stxb = Math.floor ( 665 * _gameW/1280 ),

                spx = Math.floor ( 5 * _gameW/1280 ),
                spy = spx,
                sty = Math.floor ( 206 * _gameH/720 );

            var gp = this.gamePiece [ ids ];

            
            var str = (gp.plyr == "self") ? stxa : stxb;

            var counter = ( gp.plyr == "self" ) ? this.elimCountera : this.elimCounterb;

            if ( gp.plyr == "self" ) {
                this.elimCountera++;
            }else {
                this.elimCounterb++;
            }

            gp.setVisible (false);

            this.elimScreen.add ( gp );

            var xp = Math.floor ( counter/4 ), 
                yp = counter%4;

            setTimeout ( function () {

                gp.x = str + (yp*gp.width) + gp.width/2;
                gp.y = sty + (xp*gp.height) + gp.height/2;

                gp.setVisible (true).removeInteractive();
                gp.reset();

            }, 400 );


                
        },
        showSentEmojis : function ( frame, plyr = 'self' ) {

            this.sendEmojisShown = true;

            var max = 3;

            if ( this.messages.length >= max ) {
                this.messages.splice ( 0, 1 );
            }
            this.messages.push ( { 'frame' : frame, 'plyr' : plyr });

            var w = config.width * 0.23,
                h = config.height * 0.07,
                x = 0,
                y = config.height * 0.924 - ( h* this.messages.length);

            this.shownEmojiScreen = this.add.container ( 0,0).setSize (_gameW,_gameH).setDepth (999);

            for ( var i=0; i < this.messages.length; i++) {

                var xp = w/2, yp =  y + i*h + ( h/2 );

                var rect = this.add.rectangle ( xp, yp, w, h, 0x0a0a0a, 0.6 );

                //players..
                var tx = w *0.1;

                var tmpPlyr = this.messages[i].plyr;

                var txtConfig = { 
                    color : tmpPlyr == 'self' ? '#0f0' : '#f99', 
                    fontSize : h * 0.3, 
                    fontFamily : 'Trebuchet MS', 
                    fontStyle:'bold' 
                };

                var text = this.add.text ( tx, yp, this.player[tmpPlyr].name + " :", txtConfig ).setOrigin(0,0.5);

                //images...
                var tmpFrame = this.messages[i].frame;

                var imgsize = h * 0.9, sp = imgsize * 0.15;

                var emoji = this.add.image ( tx + text.width + (imgsize/2), yp, 'emojis', tmpFrame ).setScale( _gameW/1280 * 0.4 );

               
                this.shownEmojiScreen.add ( rect );
                this.shownEmojiScreen.add ( text );
                this.shownEmojiScreen.add ( emoji );
                

            }

            var _this = this;

            this.emojiTimer = setTimeout ( function () {
                _this.removeEmojis();
            }, 2000 );

        },
        removeEmojis : function () {
            
            if ( !this.sendEmojisShown ) return;

            this.sendEmojisShown = false;

            clearTimeout (this.emojiTimer);

            this.shownEmojiScreen.destroy();

        },
        autoRespond: function () {

            var _this = this;

            clearTimeout( this.autoRespondTimeout );

            this.autoRespondTimeout = setTimeout ( function () {

                _this.removeEmojis();
                
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

                    this.clash ( post, clashResult );

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

                    this.playSound('home', 0.3 );

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
                    //movingPiece.setVisible(false);

                    residentPiece.isDestroyed = true;
                    //residentPiece.setVisible(false);
                    
                    destPost.resident = '';
                    destPost.residentPlayer = '';

                  
                    //this.elimPieces.push ( movingPiece.id );
                    //this.elimPieces.push ( residentPiece.id );
                    
                    //delete this.gamePiece[ this.activePiece];;
                    //delete this.gamePiece[ destPost.resident ];

                    this.createAnim ( destPost.x - destPost.width *0.25, destPost.y, 0 );
                    this.createAnim ( destPost.x + destPost.width *0.25, destPost.y, 1 );

                    this.playSound ('clashdraw', 0.5 );

                    this.positionElimPieces ( movingPiece.id );
                    this.positionElimPieces ( residentPiece.id );

                break;
                case 1 : 

                    destPost.resident = movingPiece.id;
                    destPost.residentPlayer = this.turn;

                    movingPiece.post = post;

                    residentPiece.isDestroyed = true;
                    //residentPiece.setVisible(false);

                    //this.elimPieces.push ( residentPiece.id );

                    this.pieceRemoved = residentPiece.id;

                    this.createAnim ( destPost.x, destPost.y, residentPiece.type );

                    this.playSound ( residentPiece.plyr == 'self' ? 'clashlost' : 'clashwon', 0.5 );

                    this.positionElimPieces ( residentPiece.id );


                break;
                case 2 : 

                    movingPiece.isDestroyed = true;
                    //movingPiece.setVisible(false);

                    this.pieceRemoved = movingPiece.id;

                    //this.elimPieces.push ( movingPiece.id );

                    this.tweens.add ({
                        targets : residentPiece,
                        rotation : Math.PI/180 * 10, 
                        duration : 100,
                        yoyo : 'true',
                        ease : 'Elastic',
                        easeParams : [1.2, 0.5]
                    });

                    this.createAnim ( destPost.x, destPost.y, movingPiece.type );
                    
                    this.playSound ( movingPiece.plyr == 'self' ? 'clashlost' : 'clashwon', 0.5 );

                    this.positionElimPieces ( movingPiece.id );


                break;

                default : 
                    //nothing to do here...
                
            }
        },
        analyzeClash : function () {

            var win = false;

            //console.log ( 'id', this.pieceRemoved );

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

            var _this = this;

            if ( _this.buttonElements.length > 0 ) {

                this.tweens.add ({
                    targets : this.buttonElements,
                    alpha : 0,
                    duration : 400,
                    ease : 'Quad.easeOut',
                    onComplete : function () {
                        this.targets[0].destroy();
                    }
                });

                this.buttonElements = [];
            }
            
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
        initializeTimer : function ( max, plyr = 'self', txt = '' ) {

            this.timerCount = 0;

            this.plyrInd [ plyr ].setTimer ( max, txt );

            this.startTimer ( max, plyr );

        },
        startTimer : function ( max, plyr ) {

            var _this = this;

            this.timeIsTicking = true;

            this.timer = setInterval ( function () {

                _this.timerCount += 1;

                _this.plyrInd [ plyr ].tick ( max - _this.timerCount );

                //console.log ('.', plyr );

                if ( _this.timerCount >= max ) {

                    _this.timerCount = 0;

                    _this.stopTimer ();

                    switch ( _this.gamePhase ) {

                        case 'prep':
        
                            _this.playSound ('warp');
        
                            _this.playerReady();
        
                        break;
                        case 'proper':
        
                            var opp = plyr == 'self' ? 'oppo' : 'self';
        
                            _this.playSound ('alarm');
                            _this.playerTimeRanOut = true;

                            _this.removeActive();
                            _this.removeBlinkers(false);
                            _this.endGame( opp );
                            
                        break;
                        default : 
                            //..
                    }

                   
                }else {

                    _this.playSound ('tick');

                }    

            }, 1000);

        },
        stopTimer : function () {

            this.timeIsTicking = false;

            clearInterval ( this.timer );
        },
        makePreparations : function () {

            this.gamePhase = 'prep';

            this.enabledPieces ('self');

            if ( !this.isRead ) this.showInstructions ();

            if (this.isTimed ) {

                this.initializeTimer ( this.maxPrepTime, 'self', '· Preparation' );

            }else {

                this.plyrInd ['self'].offTimer ('· Preparation' );
                this.plyrInd ['oppo'].offTimer ('· Preparation' );
                
            }
                
        },
        playerReady: function () {

            if ( this.timeIsTicking ) this.stopTimer ();

            if ( this.instructionsShown ) this.removeInstructions ();
            
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
                
                this.commenceGame ();

            }else {

                this.showNotif ('Waiting for other player..');

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
        commenceGame: function () {

            if ( this.instructionsShown ) this.removeInstructions();

            if ( this.isPrompted ) this.removePrompt();

            if ( this.isNotified ) this.removeNotif();

            this.plyrInd['self'].clearTimer();
            this.plyrInd['oppo'].clearTimer();
            
            this.gamePhase = 'commence';

            var _this = this;

            setTimeout ( function () {

                _this.showCommenceScreen();
                
            }, 500);

        },
        switchTurn : function () {
    
            this.turn = this.turn == 'self' ? 'oppo' : 'self';

            if ( this.isWinning != '' && this.isWinning == this.turn ) {

                this.playSound('home', 0.5 );

                this.endGame (this.turn);

            }else {
                
                this.makeTurn ();
            }
            
        },
        makeTurn :  function () {
            
            var _this = this;

            var opp = this.turn == 'self' ? 'oppo' : 'self';

            this.plyrInd [opp].clearTimer();

            this.plyrInd [this.turn].change ( 0xffff99);

            if ( !this.isTimed ) {

                this.plyrInd [this.turn].setCaption ('· Your Turn');

            }else {

                if ( this.timeIsTicking) this.stopTimer ();

                this.initializeTimer ( this.maxBlitzTime, this.turn, '· Your Turn' );
            }

            if ( this.isSinglePlayer ) {
                
                this.enabledPieces ('self', this.turn == 'self' && !this.player['self'].isAI );

                //this.enabledPieces ('oppo', this.turn == 'oppo' && !this.player['oppo'].isAI );

                if ( this.player[this.turn].isAI ) {

                    setTimeout(function () {
                        _this.autoPick();
                    }, 500 );

                }

            }else {

                this.enabledPieces ('self', this.turn == 'self');

            }
            
        },
        startGame : function () {

            //remove commence screen..
            this.commenceText.destroy();

            for ( var i in this.commenceElements ) {
                this.commenceElements [i].destroy();
            }
            this.commenceElements = [];

            //..
            this.gamePhase = 'proper';

            this.createButtons (true);

            this.makeTurn ();

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
        endGame: function ( winner='' ) {

            clearInterval (this.timer);

            this.enabledPieces ('self', false );
            this.enabledPieces ('oppo', false );
    
            this.removeButtons();

            this.gamePhase = 'end';

            this.endWinner = winner;

            if ( winner != '' ) {

                this.player[winner].wins += 1;

                this.plyrInd[winner].updateWins ( this.player[winner].wins );

            }
            
            var _this = this;
            
            if ( this.isPrompted ) this.removePrompt();

            setTimeout ( function () {

                _this.revealPieces();

                _this.showEndScreen();

            }, 500 );

        },
        showInstructions : function () {
            
            this.isRead = true;

            this.instructionsShown = true;

            var instructions = [];

            switch ( this.gamePhase ) {
                case 'prep' :
                    instructions = [
                        'Click a piece and click onto another piece to switch position.',
                        'Or click a piece and click onto an open space within friendly territory to move.',
                        'Hit Random button to set pieces to random position.',
                        'Hit Preset button to set pieces to set position.',
                        'Hit Ready button once done with the preparations.',
                        'Click this to remove the instructions.'
                    ];
                break;
                case 'proper' : 
                    instructions = [
                        'Hit "Game Draw" button to propose a draw to your opponent. Can only be done once.',
                        'Hit "Reveal Pieces" button to reveal your pieces to the opponent. Cannot be undone.',
                        'Hit "Resign" button to concede'
                    ];
                break;

            };

            this.instructionElements = [];

            var cW = config.width * 0.8,
                cH = this.fieldHeight * 0.43,
                cX = ( config.width - cW )/2,
                cY = this.fieldY + this.fieldHeight * 0.035;

                //cY = this.fieldY + ( this.fieldHeight - cH )/2;

            var graphics = this.add.graphics ().setDepth (999);

            graphics.fillStyle ( 0x0a0a0a, 0.9 );
            graphics.fillRoundedRect ( cX , cY, cW, cH, cH * 0.04 );
            
            var _this = this;

            var rect = this.add.rectangle ( cX + cW/2, cY + cH/2, cW, cH ).setInteractive ().setDepth (999);

            rect.on ('pointerdown', function () {

                _this.playSound('clicka');

                _this.removeInstructions();
            });
            var htX = config.width/2, htY = cY + cH * 0.15;

            var headTxtConfig = { 
                color : '#fff', 
                fontSize : cH * 0.08, 
                fontStyle : 'bold',
                fontFamily : "Trebuchet MS" 
            };

            var headTxt = this.add.text ( htX, htY, 'Instructions ( Preparations )', headTxtConfig ).setOrigin (0.5).setDepth (999);

            this.instructionElements.push ( graphics );
            this.instructionElements.push ( rect );
            this.instructionElements.push ( headTxt );

            var insSize = cH * 0.065, 
                insSp = insSize * 0.6,
                insX =  cX + cW * 0.1,
                insY =  cY + cH * 0.28;

            var instTxtConfig = { 
                color : '#fff', 
                fontSize : insSize,
                fontStyle : 'bold',
                fontFamily : "Trebuchet MS" 
            };

            //console.log ( instructions.length );

            for ( var i in instructions ) {
                
                var txt = this.add.text ( insX, insY + i*( insSize + insSp), '· ' + instructions[i], instTxtConfig ).setDepth (999);

                this.instructionElements.push (txt);

            }

        },
        removeInstructions : function () {

            for ( var i in this.instructionElements ) {
                this.instructionElements [i].destroy();
            }
            this.instructionsShown = false;

        },
        showCommenceScreen :  function () {
            
            this.commenceElements = [];


            var comx = Math.floor ( 587 * _gameW/1280 ),
                comy = Math.floor ( 388 * _gameH/720 );


            var commence_w = this.add.image (_gameW/2, _gameH * 0.55, 'commence_w').setScale( _gameW/1280 );

            var commence_img = this.add.image (_gameW/2, _gameH * 0.55, 'commence').setScale( _gameW/1280 );

            this.tweens.add ({
                targets : commence_img,
                rotation : '+=3',
                ease : 'Quad.easeOut',
                //yoyo : true,
                duration : 1000,
                repeat : 2
            })

            this.commenceElements = [ commence_img, commence_w ];

            var txtsize = Math.floor ( 115 * _gameH/720 );

            var txtConfig = {
                color : '#383333',
                fontSize : txtsize,
                fontFamily : 'Impact',
            };
            this.commenceText = this.add.text ( _gameW/2, _gameH * 0.55, '3', txtConfig).setOrigin(0.5);
            this.commenceText.setStroke('#d5d5d5', 3 );

            //start commence timer..

            var _this = this;
            
            var max = 3;

            this.playSound ('beep');
            
            this.counter = 0;

            this.timeIsTicking = true;

            this.timer = setInterval( function () {

                _this.counter += 1;
                
                _this.commenceText.setText ( max - _this.counter );
            
                if ( _this.counter >= max ) {
                    
                    _this.stopTimer ();

                    _this.playSound ('bell');

                    _this.startGame ();

                }else {
                    _this.playSound ('beep');
                }

            }, 1000 );

        },
        showNotif : function ( text, duration = 0 ) {

            var _this = this;

            this.isNotified = true;

            this.promptScreen = this.add.container (0, _gameH/2).setDepth(999);

            var imgBg = this.add.image ( 0,0, 'prompt_small' ).setOrigin (0).setScale(_gameW/1280);
        
            var txtx = _gameW/2,
                txty = Math.floor (258 * _gameH/720);

             // main text...
            var txtConfig = {
                color : '#ffffff',
                fontSize :  Math.floor (24 * _gameH/720),
                fontFamily : "Impact"
            }; 

            var promptTxt = this.add.text ( txtx, txty, text, txtConfig).setOrigin(0.5);

            this.promptScreen.add ([ imgBg, promptTxt]);

            this.tweens.add ({
                targets : this.promptScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });

            if ( duration > 0 ) {
                this.notifTimer = setTimeout ( function () {
                    _this.removeNotif();
                }, duration );
            }

           
            
        },
        removeNotif : function () {

            if ( !this.isNotified ) return;

            clearTimeout ( this.notifTimer );

            this.isNotified = false;

            this.promptScreen.destroy();

        },
        showPromptBig : function ( text, caption = '', tSize = 'sm', dataArr = [] ) {

            var txtsize = 0;

            switch ( tSize ) {
                case 'sm' :
                    txtsize = Math.floor (32 * _gameH/720);
                    break;
                case 'xl' :
                    txtsize = Math.floor (52 * _gameH/720);
                break;
                default :   
                     
            }
    
            this.isPrompted = true;

            this.promptScreen = this.add.container (0,_gameH).setDepth(999);

            var imgBg = this.add.image ( 0,0, 'prompt_big' ).setOrigin (0).setScale(_gameW/1280).setInteractive();
        
            var txtx = _gameW/2,
                txtya = Math.floor (323 * _gameH/720), // main..
                txtyb = Math.floor (370 * _gameH/720); // caption..

             // main text...
            var txtConfig = {
                color : '#ffffff',
                fontSize : txtsize,
                fontFamily : "Impact"
            }; 
            var promptTxt = this.add.text ( txtx, txtya, text, txtConfig).setOrigin(0.5);


             // caption text...
            var captionTxtConfig = {
                color : '#cafb05',
                fontSize : txtsize * 0.4,
                fontFamily : "Poppins"
            };
            var captionTxt = this.add.text ( txtx, txtyb, caption, captionTxtConfig ).setOrigin(0.5);

            this.promptScreen.add ([imgBg, promptTxt, captionTxt]);


            var btw = Math.floor ( 197 * _gameW/1280 ),
                bth = Math.floor ( 62 * _gameH/720 ),
                bts = btw * 0.1,
                btx = (_gameW - ((btw * 2) + bts))/2 + btw/2,
                bty = Math.floor ( 430 * _gameH/720 );
                
            var _this = this;
            
            for ( var i = 0; i < dataArr.length; i++ ) {

                var btn = this.add.image ( btx + i * (btw + bts), bty, 'prompt_btns2', dataArr[i].frame ).setScale (_gameW/1280).setData ( dataArr[i] ).setInteractive();
                
                btn.on ('pointerdown', function() {
                    _this.playSound('clicka');
                    _this.promptBtnsClick ( this.getData('id') );
                });
                btn.on ('pointerover', function() {
                    this.setFrame ( this.getData('frame') + 1 );
                });
                btn.on ('pointerup', function() {
                    this.setFrame ( this.getData('frame') );
                });
                btn.on ('pointerout', function() {
                    this.setFrame ( this.getData('frame'));
                });

                _this.promptScreen.add ( btn );

            }

            this.tweens.add ({
                targets : this.promptScreen,
                y : 0,
                duration : 300,
                easeParams : [0, 1.5],
                ease : 'Elastic'
            });
            //....
        },
        removePrompt: function () {

            if (!this.isPrompted) return;

            this.isPrompted = false;

            this.promptScreen.destroy ();

        },
        showLeaveScreen : function () {

            var btnsData = [{ id : 'leave', frame : 0}, { id : 'cancel', frame : 2} ];

            this.showPromptBig ( 'Are you sure you want to leave the game?', '', 'sm', btnsData );

        },
        showEndScreen : function () {

            this.playSound ('alternate');

            var txt = '', captionTxt = '';

            switch ( this.endWinner ) {
                case 'self' : 
                    txt = 'Congrats! You win.';

                    if ( this.playerResign ) captionTxt = 'Opponent has resigned.';

                    if ( this.playerTimeRanOut ) captionTxt = 'Opponent has failed to make turn.';

                break;
                case 'oppo' : 
                    txt = 'Sorry, You lose.';

                    if ( this.playerResign ) captionTxt = 'You have resigned.';

                    if ( this.playerTimeRanOut ) captionTxt = 'You have failed to make turn.';

                    
                break;
                default : 
                    txt = 'Game is a draw.';
            }
            
            
            var btnsData = [{ id : 'rematch', frame : 4}, { id : 'quit', frame : 6} ];

            this.showPromptBig ( txt, captionTxt, 'xl', btnsData );


        

        },
        showResignScreen : function () {

            var btnsData = [{ id : 'resign', frame : 0}, { id : 'cancel', frame : 2} ];

            this.showPromptBig ( 'Are you sure you want to resign?', '', 'sm', btnsData );

        },
        showRevealScreen : function () {

            var btnsData = [{ id : 'reveal', frame : 0}, { id : 'cancel', frame : 2} ];

            this.showPromptBig ( 'Are you sure you want to reveal your pieces?', '', 'sm', btnsData );

        },
        showDrawScreen : function () {

            var btnsData = [{ id : 'proposedraw', frame : 0}, { id : 'cancel', frame : 2} ];

            this.showPromptBig ( 'Are you sure you want to propose a draw?', '', 'sm', btnsData );

        },
        showDrawResponseScreen :  function () {

            var btnsData = [{ id : 'acceptdraw', frame : 8}, { id : 'rejectdraw', frame : 10} ];

            this.showPromptBig ( 'Opponent has offered a draw?', '', 'sm', btnsData );

        },
        drawResponse :  function () {

            var _this = this;

            setTimeout ( function () {

                _this.removeNotif ();

                if ( Math.random() > 0.25 ) {

                    _this.playSound ('message');
                    
                    _this.showNotif ( 'Opponent declines. Game resumes.', 2000 );

                    if ( _this.isTimed) _this.startTimer ( _this.maxBlitzTime, _this.turn );


                }else {

                    _this.playSound ('warp');

                    _this.endGame ();
                }
                
            }, 2000 );


        },
        promptBtnsClick : function (id) {

            //console.log ('click', id );
            var _this = this;

            this.playSound('clicka');

            switch ( id ) {

                case 'acceptdraw' :
                    this.removePrompt();

                    socket.emit ('playerDrawResponse', true );
                    break;
                case 'rejectdraw' :
                    this.removePrompt();

                    socket.emit ('playerDrawResponse', false );
                    break;

                case 'proposedraw' :

                    
                    this.removePrompt();
    
                    if ( this.timeIsTicking ) this.stopTimer ();

                    this.showNotif ("Waiting for opponent's response..");

                    if ( this.isSinglePlayer ) {

                        _this.drawResponse ();
                        
                    }else {

                        socket.emit ( 'playerOfferedADraw' );
                    }

                    break;

                case 'reveal' : 

                    this.removePrompt();
                                
                    setTimeout ( function () {
                        _this.playSound('bleep', 0.4);
                        _this.plyrInd['self'].updateStatus();
                    }, 300); 

                    if ( !this.isSinglePlayer ) socket.emit ('piecesReveal');
                
                    break;

                case 'resign' :

                    this.removePrompt();

                    this.playerResign = true;
    
                    if ( this.isSinglePlayer ) {
                        this.endGame ('oppo');
                    }else {
                        socket.emit ('playerResign');
                    }
                
                    break;

                case 'rematch' : 
                    //..
                    if ( this.isSinglePlayer ) {

                        this.resetGame();
    
                    }else {
                        
                        socket.emit ('rematchRequest');
    
                        this.removePrompt();
    
                        setTimeout ( function () {
                            _this.showNotif ('Waiting for other player..');
                        }, 200 );
                    
                    }
                    
                    break;
                case 'quit':

                    _this.leaveGame();

                    break;
                case 'cancel' :

                    this.removePrompt ();

                    break;
                case 'leave':
                
                    this.leaveGame();

                    break;
                default :
                    //.. 
            }
        },
        setOppoRanks : function ( pieces ) {

            for ( var i in pieces ) {

                var myPiece = this.gamePiece ['oppo_' + pieces[i].cnt ];

                myPiece.rnk = pieces[i].rank;

                if ( this.gamePhase == 'end' && !myPiece.isFlipped ) {
                    myPiece.flip();
                }
            }

        }, 
        resetGame : function () {

            this.elimCountera = 0;
            this.elimCounterb = 0;

            this.removePrompt();
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
            this.playerTimeRanOut = false;
            
            this.elimPieces = [];

            var _this = this;

            this.presetIndex = Math.floor ( Math.floor(Math.random()*6) );;

            var postArr = this.presetPost ( this.presetIndex );

            setTimeout ( function () {

                _this.createGamePiecesData ('self', postArr );

                _this.createGamePieces('self');

                _this.createButtons();

                _this.makePreparations()

            }, 500);
            
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
        playSound: function ( key, vol=0.8 ) {

            if ( !this.soundOff ) {
                
                if ( key == 'tick') {
                    this.tick.play();
                }else {
                    this.music.play (key , { volume : vol });
                }
            }

        },
        leaveGame : function () {
            
            if ( this.timeIsTicking ) this.stopTimer ();

            if ( this.sendEmojisShown ) this.removeEmojis();

            if ( this.isNotified ) this.removeNotif ();
            
            socket.emit ('leaveGame');

            socket.removeAllListeners();

            this.bgmusic.stop();

            this.scene.start('Intro');
           
        },
        
    });



    // Container Class..
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
        
            this.isDestroyed = false;
            //this.bgColor = type == 0 ? 0xffffff : 0x000000;
            this.isFlipped = false;
            this.origin = plyr == 'self' ? 'bot' : 'top';
            this.rot = plyr == 'self' ? 0 : 180;

            //this.shape = scene.add.graphics ( { fillStyle: { color: this.bgColor, alpha: 1 }, lineStyle: { width : 1, color : 0x6c6c6c } } );
            //this.shape.fillRoundedRect ( -width/2, -height/2, width, height, height * 0.1);
            //this.shape.strokeRoundedRect ( -width/2, -height/2, width, height, height * 0.1);

            this.imgBg = scene.add.image ( 0, 0, 'piece', type ).setScale(_gameW/1280).setRotation ( this.rot * Math.PI/180 );

            var txtConfig = { 
                color: type == 0 ? '#1c1c1c' : '#dedede',
                fontFamily: 'Poppins', 
                fontSize: Math.floor(height * 0.2), 
                fontStyle : 'bold' 
            };

            var top = -height/2,
                left = -width/2;

            var imgSize = width * 0.5;

            var indx = type == 0 ? 15 : 16;

            this.image = scene.add.image ( 0, top + height*0.4, 'thumbs', indx ).setScale(_gameW/1280);

            this.txt = scene.add.text ( 0, top + height * 0.75, '', txtConfig ).setOrigin(0.5);

            this.add ([this.imgBg, this.image, this.txt]);

            scene.children.add ( this );
            
        },

        change : function ( clr ) {
            //console.log ( 'gp tinamawag', clr )
        },
        activate : function () {

            var clr = this.type == 0 ? 2 : 3;

            this.imgBg.setFrame ( clr )

            this.activated = true;

            //this.setInteractive (true);

        },
        reset : function () {

            var clr = this.type == 0 ? 0 : 1;

            this.imgBg.setFrame ( clr )

            this.activated = false;

        },
        flip: function () {

            var ranks = [
                'General','General','General','General','General',
                'Colonel','Lt. Colonel','Major', 'Captain', '1st Lt.',
                '2nd Lt.','Sergeant','Private','Flag','Spy'
            ];

            if ( this.rnk > 0 ) {
                
                this.isFlipped = true;

                this.image.setFrame (this.rnk - 1);

                this.txt.text = ranks[this.rnk - 1];
                
            }

        }
        
    });
  
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
            
            this.rect = scene.add.rectangle ( 0, 0, width, height, 0x00cc00, 0.4 );

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
            
            this.image = scene.add.image ( 0, 0, 'thumbs', imgFrame ).setScale( _gameW/1280 ).setAlpha(0);
            
            scene.tweens.add ({
                targets : this.image,
                alpha : 1,
                duration : 400,
                yoyo : true,
                repeat : -1,
                ease : 'Sine.easeIn'
            });

            //add to container...
            this.add ([this.rect, this.image]);

            scene.children.add ( this );

            
            
        },
        
    });

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
            //this.bgColor = '0xf5f5f5'

            this.bg = scene.add.image (0, 0, 'indicatorbg', 0 ).setScale(_gameW/1280);

            
            //players name...
            var top = -height/2, 
                left = -width/2;

            this.avatar = scene.add.image ( left + width *0.065, 0, 'thumbs', 18 ).setScale ( _gameW/1280 );

            //name text...
            var nameConfig = { 
                fontFamily: 'Impact', 
                fontSize: Math.floor(height * 0.35), 
                color: '#5e5e5e' 
            };

            var tX = left + (width * 0.13 ),
                tY = top + (height * 0.17); 

            this.nameTxt = scene.add.text ( tX, tY, name, nameConfig ).setOrigin(0);


            //win text...
            var winConfig = { 
                fontFamily: 'Impact', 
                fontSize: Math.floor(height * 0.28), 
                color: '#746a62' 
            };

            var tXa = left + (width * 0.13 ),
                tYa = top + (height * 0.55); 

            this.winTxt = scene.add.text ( tXa, tYa, '✪ Wins: 0', winConfig ).setOrigin(0);

            //mode text...
            var modeConfig = { 
                fontFamily: 'Impact', 
                fontSize: Math.floor(height * 0.26),  
                color: '#5e5e5e' 
            };

            var tXb = left + (width * 0.93),
                tYb = top + (height * 0.16); 

            this.caption = scene.add.text ( tXb, tYb, '· Preparation', modeConfig ).setOrigin(1, 0);


            //mode text...
            var timerConfig = { 
                fontFamily: 'Impact', 
                fontSize: Math.floor(height * 0.35), 
                color: '#746a62' 
            };

            var tXb = left + (width * 0.93),
                tYb = top + (height * 0.47); 

            this.timertxt = scene.add.text ( tXb, tYb, '00:00:00', timerConfig ).setOrigin(1, 0);

            var rW = width * 0.02,
                rH = height * 0.645,
                rX = left + width *0.942,
                rY = top + height *0.2;

            this.bar = scene.add.rectangle (rX, rY, rW, rH, 0x3a3a3a, 0.5 ).setOrigin (0);

            this.add ([ this.bg, this.avatar, this.nameTxt, this.winTxt, this.caption, this.timertxt, this.bar ]); // add elements to this container..

            scene.children.add ( this ); //add to scene...

        },

        forceEnd : function () {

            this.bar.setFillStyle( 0x3a3a3a, 0.5 );

            this.timertxt.text = "00:00:00";

        },
        tick: function ( time ) {

            //if ( time <= 3 ) this.timertxt.setColor ( '#f33' );

            var fin = ( time < 10 ) ? '0' + time : time;

            this.timertxt.setText ( '00:00:' + fin );
            
            var oH = this.height * 0.645,
                bH = oH * time/this.maxTime;
        
            var clr = time > 5 ? 0xf26c4f : 0xff0033;

            var top = -(this.height/2);

            this.bar.setVisible(true).setFillStyle ( clr , 1 );
            this.bar.height = bH;
            this.bar.y = (top + this.height *0.2) + (oH - bH);

        },
        offTimer :  function ( caption ) {
            
            this.bar.setVisible(false);

            this.timertxt.setVisible ( false );

            this.scene.tweens.add ({
                targets : this.caption,
                x : this.width * 0.465,
                duration : 500,
                ease : 'Power2'
            });

            this.setCaption ( caption );

            

        },
        setCaption : function ( txt ) {
            this.caption.text = txt;
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

            //this.bar.fillStyle ( 0x00ff33, 1);

            //this.bar.fillRect ( left + this.width * 0.94, top + this.height * 0.8 - bH, bW, bH );

        },
        clearTimer : function () {

            this.timertxt.text = '';

            this.caption.text = '';

            this.bar.setVisible(false);

            this.change ( this.bgColor );

        },
        updateWins : function ( winCount ) {

            this.winCount = winCount;

            this.winTxt.setText ( '✪ Wins : ' + winCount);
        
        },
        updateStatus : function () {

            this.avatar.setFrame( 17 )

            this.scene.tweens.add ({
                targets : this.image,
                scaleX : (_gameW/1280 * 0.2),
                scaleY : (_gameW/1280 * 0.2),
                duration : 100,
                ease : 'Power2',
                yoyo : true
            });

            //this.text.setText (  + this.name );
        },
        resetStatus : function () {
            
            this.clearTimer();
            
            this.bg.setFrame (0);

            this.avatar.setFrame ( 18 );
            
        },
        ready : function () {

            this.bg.setFrame (1);

            this.caption.text = '· Ready';

        },
        change : function ( clr ) {
            this.bg.setFrame (1);
        },

    });

}
    