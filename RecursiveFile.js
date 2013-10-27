/*
 * RecursiveFile.js
 * 再帰的にファイルを探索し任意の処理を実行するためのクラス。
 * 必要に応じて次のメソッドが実装すること。
 *
 *   initialize     すべての処理の前に実行するメソッド
 *   execFile       ファイルに対する処理メソッド
 *   resolveError   ファイルに対して処理をしている最中にエラーが発生した時の処理メソッド
 *   finalize       ファイルに対する処理が全て完了した後に実行するメソッド
 *
 *   実装例)
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
     * ファイル探索階層深度
     * カレントフォルダを 1 とし、辿るサブフォルダの深さを指定する。
     */
    var depth = 255;

    this.getDepth = function(){
        return depth;
    };

    this.setDepth = function(i){
        depth = i === undefined ? depth : parseInt(i);
    };


    /**
     * ファイル名マッチパターン
     * 複数指定する場合はデリミタで区切る。
     * パターン文字列の保持とゲッターでの返却にのみ用いる。
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
     * ファイル名マッチパターンの配列
     * マッチング処理をしやすいよう分割しこの配列に格納して使用する。
     */
    var aryPatern = new Array(patern);
    
    
    /**
     * ファイル名マッチパターンデリミタ
     */
    var paternDelim = ";";
    
    this.getPaternDelim = function(str){
        return paternDelim;
    }
    
    this.setPaternDelim = function(str){
        paternDelim = str;
    }



    /**
     * 処理対象ファイル標準出力フラグ
     * ただしCScriptでの実行にのみ限る。
     * true: 処理実行中に対象のファイル・フォルダのフルパスを標準出力する。
     * false: 標準出力を行わない。
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
     * ファイルに対して処理を実施した回数カウンタ
     */
    var doneCount = 0;



    /**
     * メイン処理
     * @throws
     **/
    this.exec = function( args ){
        if( args.length == 0 ){ WScript.Echo("パラメータがありません。"); }
        doneCount = 0;
        this.initialize();
        recursive( args );
        this.finalize( args );
    };
    
    
    
    /**
     * 初期化処理
     */
    this.initialize = function( args ){
        // require implement
    }



    /**
     * ファイル探索処理
     * @param args ファイルパスのコレクション
     * @param nowDepth サブフォルダの階層。指定値がない場合0となる。
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
     * ファイルに対する処理のプロセス管理
     * ファイル名のパターンマッチおよび、ファイルへ実行処理への引渡しを行う。
     * @param path 対象ファイルパス
     */
    function processFile( path ){
        if( checkPaternMatch(path) ){
            if(verbose && checkWScript() == false){ WScript.Echo(path); }
            self.execFile(path);
            doneCount++;
        }
    };

    /**
     * ファイル名のパターンマッチチェック
     * @param path チェック対象ファイルパス
     * @retun boolean チェック結果
     *     true: チェックOK  false: チェックNG
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
     * ファイルに対する処理
     * @param path 処理対象ファイルパス
     */
    this.execFile = function( path ){
        // require implement
    };

    /**
     * 不明なファイルに対する処理
     * 存在しないファイルまたは、移動や削除などによりパスが変更になった場合本処理が動作する。
     * @param path 不明なファイルのパス
     */
    this.execUnknown = function( path ){
        if(verbose && checkWScript() == false){
            WScript.Echo("次のファイルは移動または削除されました。 " + path);
        }
    };

    /**
     * エラー処理
     * @param ex Exception
     */
    this.resolveError = function( ex, path ){
        // require implement
        WScript.Echo( ex + "\n" + ex.description + "\n" + path );
    };  

    /**
     * 終了処理
     * @param args 処理対象ファイルパス
     */
    this.finalize = function( args ){
        // require implement
    };
    
    /**
     * WScript/CScriptのチェック
     */
    function checkWScript(){
        return /WScript.exe/im.test(WScript.FullName);
    }
};

var dbg = new RecursiveFile;
dbg.setDepth(1);
dbg.verboseEnable();
dbg.exec(WScript.arguments);

