/**
 * Sample Inherit Class
 */
function InheritSample(){
    RecursiveFile.apply( this, arguments );
    this.execFile = function(path){
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var file = fso.GetFile(path);
        WScript.Echo(file.DateLastModified);
    }
}

var t = new InheritSample;
t.setDepth(3);
t.enableVerbose();
t.exec(WScript.arguments);