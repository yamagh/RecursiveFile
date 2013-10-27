/*
 * RecursiveFile.js
 * �ċA�I�Ƀt�@�C����T�����C�ӂ̏��������s���邽�߂̃N���X�B
 * �K�v�ɉ����Ď��̃��\�b�h���������邱�ƁB
 *
 *   initialize     ���ׂĂ̏����̑O�Ɏ��s���郁�\�b�h
 *   execFile       �t�@�C���ɑ΂��鏈�����\�b�h
 *   resolveError   �t�@�C���ɑ΂��ď��������Ă���Œ��ɃG���[�������������̏������\�b�h
 *   finalize       �t�@�C���ɑ΂��鏈�����S�Ċ���������Ɏ��s���郁�\�b�h
 *
 *   ������)
 *     function InheritClass(){
 *         RecursiveFile.apply( this, arguments );
 *         this.execFile = function(){
 *             hogehoge;
 *         }
 *     };
 *
 * @author ygmh
 * @version 1.00
 */
function RecursiveFile(){

    var self = this;

    /**
     * �t�@�C���T���K�w�[�x
     * �J�����g�t�H���_�� 1 �Ƃ��A�H��T�u�t�H���_�̐[�����w�肷��B
     */
    var depth = 255;

    this.getDepth = function(){
        return depth;
    };

    this.setDepth = function(i){
        depth = i === undefined ? depth : parseInt(i);
    };


    /**
     * �t�@�C�����}�b�`�p�^�[��
     * �����w�肷��ꍇ�̓f���~�^�ŋ�؂�B
     * �p�^�[��������̕ێ��ƃQ�b�^�[�ł̕ԋp�ɂ̂ݗp����B
     */
    var patern = "*";

    this.getPatern = function(){
        return patern;
    };
    
    this.setPatern = function(str){
        patern = str;
        str = str.replace(/(^;+|;+$|\s+)/img, "");
        str = str.replace(/\;+/img, ";");
        str = str.replace(/\*+/img, "*");
        aryPatern = str.split(paternDelim);
//        var e = new Enumerator( aryPatern );
//        for(;!e.atEnd(); e.moveNext()){
//            WScript.echo( e.item() );
//        }
    };
    

    /**
     * �t�@�C�����}�b�`�p�^�[���̔z��
     * �}�b�`���O���������₷���悤���������̔z��Ɋi�[���Ďg�p����B
     */
    var aryPatern = new Array(patern);
    
    
    /**
     * �t�@�C�����}�b�`�p�^�[���f���~�^
     */
    var paternDelim = ";";
    
    this.getPaternDelim = function(str){
        return paternDelim;
    }
    
    this.setPaternDelim = function(str){
        paternDelim = str;
    }



    /**
     * �����Ώۃt�@�C���W���o�̓t���O
     * ������CScript�ł̎��s�ɂ̂݌���B
     * true: �������s���ɑΏۂ̃t�@�C���E�t�H���_�̃t���p�X��W���o�͂���B
     * false: �W���o�͂��s��Ȃ��B
     */
    var verbose = false;
    
    this.verboseEnable = function(){
        verbose = true;
    }
    
    this.verboseDisable = function(){
        verbose = false;
    }
    
    this.getVerbose = function(){
        return verbose;
    }
    
    
    /**
     * �t�@�C���ɑ΂��ď��������{�����񐔃J�E���^
     */
    var doneCount = 0;



    /**
     * ���C������
     * @throws
     **/
    this.exec = function( args ){
        if( args.length == 0 ){ WScript.Echo("�p�����[�^������܂���B"); }
        doneCount = 0;
        this.initialize();
        recursive( args );
        this.finalize( args );
    };
    
    
    
    /**
     * ����������
     */
    this.initialize = function( args ){
        // require implement
    }



    /**
     * �t�@�C���T������
     * @param args �t�@�C���p�X�̃R���N�V����
     * @param nowDepth �T�u�t�H���_�̊K�w�B�w��l���Ȃ��ꍇ0�ƂȂ�B
     */
    function recursive ( args, nowDepth ){
        nowDepth = nowDepth === undefined ? 0 : nowDepth;
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var e = new Enumerator( args );
        
        for( ;!e.atEnd(); e.moveNext() ){
            var i = e.item();
            
            if(fso.FileExists(i)){
                try{
                    processFile( i );
                }catch( ex ){
                    self.resolveError( ex, i );
                }
                
            } else if(fso.FolderExists(i)){ 
                if(nowDepth++ < depth){
                    recursive( fso.GetFolder(i).Files, nowDepth );
                    recursive( fso.GetFolder(i).SubFolders, nowDepth-- );
                }

            } else { 
                self.execUnknown(i);

            }
        }
    };

    /**
     * �t�@�C���ɑ΂��鏈���̃v���Z�X�Ǘ�
     * �t�@�C�����̃p�^�[���}�b�`����сA�t�@�C���֎��s�����ւ̈��n�����s���B
     * @param path �Ώۃt�@�C���p�X
     */
    function processFile( path ){
        if( checkPaternMatch(path) ){
            if(verbose && checkWScript() == false){ WScript.Echo(path); }
            self.execFile(path);
            doneCount++;
        }
    };

    /**
     * �t�@�C�����̃p�^�[���}�b�`�`�F�b�N
     * @param path �`�F�b�N�Ώۃt�@�C���p�X
     * @retun boolean �`�F�b�N����
     *     true: �`�F�b�NOK  false: �`�F�b�NNG
     */
    function checkPaternMatch( path ){
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var checkTarget = fso.GetFileName(path);
        for(var i=0, len=aryPatern.length; i<len; i++){
            if( aryPatern[i]=="*"){ return true; }
            var reg = new RegExp(aryPatern[i], "igm");
            if( reg.test(path) ){ return true; }
        }
        return false;
    };

    /**
     * �t�@�C���ɑ΂��鏈��
     * @param path �����Ώۃt�@�C���p�X
     */
    this.execFile = function( path ){
        // require implement
    };

    /**
     * �s���ȃt�@�C���ɑ΂��鏈��
     * ���݂��Ȃ��t�@�C���܂��́A�ړ���폜�Ȃǂɂ��p�X���ύX�ɂȂ����ꍇ�{���������삷��B
     * @param path �s���ȃt�@�C���̃p�X
     */
    this.execUnknown = function( path ){
        if(verbose && checkWScript() == false){
            WScript.Echo("���̃t�@�C���͈ړ��܂��͍폜����܂����B " + path);
        }
    };

    /**
     * �G���[����
     * @param ex Exception
     */
    this.resolveError = function( ex, path ){
        // require implement
        WScript.Echo( ex + "\n" + ex.description + "\n" + path );
    };  

    /**
     * �I������
     * @param args �����Ώۃt�@�C���p�X
     */
    this.finalize = function( args ){
        // require implement
    };
    
    /**
     * WScript/CScript�̃`�F�b�N
     */
    function checkWScript(){
        return /WScript.exe/im.test(WScript.FullName);
    }
};

var dbg = new RecursiveFile;
dbg.setDepth(1);
dbg.verboseEnable();
dbg.exec(WScript.arguments);

