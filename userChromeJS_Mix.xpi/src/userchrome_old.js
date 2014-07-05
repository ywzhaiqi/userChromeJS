/*
 * userChromeJS
 * 
 * This file can be used to customize the functioning of Mozilla's user
 * interface.  Usage and syntax follow below; for useful code snippets see
 * http://mozilla.zeniko.ch/userchrome.js.html.
 * 
 * Examples:
 * setTimeout(function() { document.title = "A new title for every window" }, 2000);
 * 
 * if (location == "chrome://browser/content/browser.xul") {
 *   alert("Script loaded in main browser only");
 * }
 * 
 * // DOMi window 
 * if (location == "chrome://inspector/content/inspector.xul") {
 *    // Move Urlbar box to main toolbar
 *    var tb = document.getElementById('bxURLBar');
 *    var el = document.getElementById('mbrInspectorMain');
 *    if (tb && el) el.appendChild(tb, el.firstChild);
 * }
 * 
 * NOTE: userChromeJS includes an 'import' function to facilitate file management.
 * An absolute path or relative path with Directory name property token can be
 * used, as follows:
 * 
 * // Single file (javascript .js or overlay .xul file)
 * userChrome.import("Full file path");
 * userChrome.import("Relative file path", "Token");
 * // All .js and .xul files in a folder will be loaded. 
 * userChrome.import("Full file folder path");
 * userChrome.import("Relative file folder path/name", "Token");
 * userChrome.import("*", "Token");
 * 
 * NOTE: absolute windows files and folders must be have backslash escaped:
 * "C:\\Program Files\\Mozilla\\scripts\\myscript.js"
 * 
 * Examples:
 * // Import script in [ProfileDir]/chrome/scripts/myscript.js
 * userChrome.import("scripts/myscript.js", "UChrm");
 * // Import script in [Profiles]/scripts/myscript.js (share same script in
 * // multiple profiles
 * userChrome.import("scripts/myscript.js", "DefProfRt");
 * // All .js or .xul in profile chrome directory
 * userChrome.import("*", "UChrm");
 * // Import overlay
 * userChrome.import("C:\\Program Files\\Mozilla\\scripts\\myOverlay.xul");
 * // Import everything in Desktop folder /scripts
 * userChrome.import("scripts", "Desk");
 * // Perhaps the only thing you need in this file..
 * if (location == "chrome://browser/content/browser.xul") {
 *  userChrome.import("scripts", "DefProfRt");
 * }
 * 
 * NOTE: for a full listing of directory tokens see the two links found here:
 * https://developer.mozilla.org/en/Code_snippets/File_I%2f%2fO#Getting_special_files
 * // What's the path for a token?  This will print it in the console..
 * userChrome.log(userChrome.getAbsoluteFile("Desk").path, "getAbsoluteFile:'Desk'");
 * 
 * NOTE: userChromeJS includes a log function, invoked as follows:
 * userChrome.log("string1", ["string2"])
 * Example:
 * userChrome.log("hello world!", "myscript.js");
 * Results in a console message:
 * 2009-05-22 18:07:40 userChromeJS.js::myscript.js: hello world!
 * 
 * NOTE: the date format for the userChrome.log console logger may be user defined:
 * Example:
 * userChrome.dateFormat = "%Y-%m-%d %H:%M:%S";
 * 
 * NOTE: the default charSet is "UTF-8"; for code using the 'import' or
 *       'importFolder' functions to manage files, the charSet for subscript loader
 *       may be user defined, prior to calling the import or importFolder functions:
 * Example:
 * userChrome.charSet = "UTF-8";
 * 
 * NOTE: the following shortcuts are predefined:
 * Cc = Components.classes;
 * Ci = Components.interfaces;
 * Cr = Components.results;
 * Cu = Components.utils;
 *
 */
