/*
 * RecursiveFile.js
 *
 * It is a class to run the process to explore the files recursively.
 * By implementing the following methods as necessary.
 *
 *   initialize      Method to run before processing all
 *   execFile(path)  The processing method to the file.
 *   resolveError    Processing method when an error occurs while you are processing on file
 *   finalize        Method to run after the processing for the file is complete all
 *
 *   Inherit Sample)
 *     function InheritClass(){
 *         RecursiveFile.apply( this, arguments );
 *         this.execFile = function(path){
 *             hogehoge;
 *         }
 *     };
 *
 * @author ygmh
 */
function RecursiveFile(){

    var self = this;

    /**
     * File search hierarchy depth
     * Current folder is 1.
     */
    var depth = 255;

    this.getDepth = function(){
        return depth;
    };

    this.setDepth = function(i){
        depth = i === undefined ? depth : parseInt(i);
    };



    /**
     * Match pattern of file name
     * Separated by a delimiter if you want to specify more than one.
     * The default delimiter is semicolon ";".
     * Delimiter can be changed by the `setPatternDelim` method.
     *
     * Used only to return in the getter and the holding of the pattern string.
     * They are stored by dividing it into "aryPattern" pattern string that is set by the "setPattern".
     */
    var pattern = "*";

    this.getPattern = function(){
        return pattern;
    };
    
    this.setPattern = function(str){
        pattern = str;
        str = str.replace(/(^;+|;+$|\s+)/img, "");
        str = str.replace(/\;+/img, ";");
        str = str.replace(/\*+/img, "*");
        aryPattern = str.split(patternDelim);
    };



    /**
     * Array of file names match pattern
     * Used to be stored in the array is divided so as to easily matching process.
     */
    var aryPattern = new Array(pattern);



    /**
     * File name match pattern delimiter
     */
    var patternDelim = ";";
    
    this.getPatternDelim = function(str){
        return patternDelim;
    }
    
    this.setPatternDelim = function(str){
        patternDelim = str;
    }



    /**
     * Standard output flag
     * If flag is True, to show the name of the file being processed.
     * However, limited only to run on CScript.
     * true: 処理実行中に対象のファイル・フォルダのフルパスを標準出力する。
     * false: 標準出力を行わない。
     */
    var verbose = false;

    this.enableVerbose = function(){
        verbose = true;
    }
    
    this.disableVerbose = function(){
        verbose = false;
    }



    /**
     * Counter of performing the processing on the file
     */
    var doneCount = 0;



    /**
     * Main processing
     */
    this.exec = function( args ){
        if( args.length == 0 ){ WScript.Echo("Parameters is nothing."); }
        doneCount = 0;
        this.initialize(args);
        recursive( args );
        this.finalize( args );
    };
    
    
    
    /**
     * Initializing process
     * @param args Targets file path.
     */
    this.initialize = function( args ){
        // require implement
    }



    /**
     * File search process
     * @param args Collection of file path
     * @param nowDepth Depth hierarchy of subfolders。
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
     * Process management of processing the files
     * And filename pattern matching, to perform the delivery of your operation.
     * @param path Target file path
     */
    function processFile( path ){
        if( checkPatternMatch(path) ){
            if(verbose && isCScript()){ WScript.Echo(path); }
            self.execFile(path);
            doneCount++;
        }
    };



    /**
     * Pattern matching check in the file name
     * @param path Check the target file path
     * @retun boolean Check result
     *     true: Check OK  false: Check NG
     */
    function checkPatternMatch( path ){
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var checkTarget = fso.GetFileName(path);
        for(var i=0, len=aryPattern.length; i<len; i++){
            if( aryPattern[i]=="*"){ return true; }
            var reg = new RegExp(aryPattern[i], "igm");
            if( reg.test(path) ){ return true; }
        }
        return false;
    };



    /**
     * The process for the file
     * @param path Processed file path
     */
    this.execFile = function( path ){
        // require implement
    };



    /**
     * Actions to be performed with an unknown file
     * Or file does not exist, processing if this path is changed or deleted by the move to work.
     * @param path Path of an unknown file
     */
    this.execUnknown = function( path ){
        if(verbose && isCScript() == false){
            WScript.Echo("The following files have been moved or deleted. " + path);
        }
    };



    /**
     * Error handling
     * @param ex Exception
     */
    this.resolveError = function( ex, path ){
        // require implement
        WScript.Echo( ex + "\n" + ex.description + "\n" + path );
    };  



    /**
     * End processing
     * @param args Targets file path.
     */
    this.finalize = function( args ){
        // require implement
    };



    /**
     * Check the WScript / CScript
     */
    function isCScript(){
        return /cscript.exe/im.test(WScript.FullName);
    }
};

//var dbg = new RecursiveFile;
//dbg.setDepth(1);
//dbg.enableVerbose();
//dbg.exec(WScript.arguments);
