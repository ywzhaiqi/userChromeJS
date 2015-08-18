/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the userChromeJS utilities.
 *
 * The Initial Developer of the Original Code is
 * alta88 <alta88@gmail.com>
 *
 * Portions created by the Initial Developer are Copyright (C) 2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var EXPORTED_SYMBOLS = ["userChrome"];

Components.utils.import("resource://gre/modules/Services.jsm");

/* ........ Utility functions ............................................... */

var userChrome = {
  /* Console logger */
  log: function(aMsg, aCaller) {
    Services.console.logStringMessage(this.date + " extensions.userChromeJS: " +
                                      (aCaller ? aCaller +": " : "") + aMsg);
  },

  path: null,
  dirToken: null,
  overlayPollDelay: 200,

  // Overlay observer.
  Observer: {
    queued: null,
    observe: function(aSubject, aTopic, aData) {
      if ((aTopic != "xul-overlay-merged" && aTopic != null) ||
          !(aSubject instanceof Components.interfaces.nsIURI))
        return;

      let fileUrl = aSubject.QueryInterface(Components.interfaces.nsIURI).spec;
//userChrome.log("aTopic:overlay fileUrl - "+aTopic+":"+fileUrl, "Observer.observe");
      if (this.queued != fileUrl)
        return;

userChrome.log(aTopic+" - "+fileUrl, "userChrome.Observer");
      this.queued = null;
    }
  },

  import: function(aPath, aRelDirToken) {
    let file;
    this.path = aPath;
    this.dirToken = aRelDirToken;

    if (aRelDirToken) {
      // Relative file.
      let absDir = this.getAbsoluteFile(aRelDirToken);
      if (!absDir)
        return;
      let pathSep = absDir.path.match(/[\/\\]/)[0];
      file = absDir.path + (aPath == "*" ?
          "" : pathSep + aPath.replace(/[\/\\]/g, pathSep));
    }
    else
      // Absolute file.
      file = aPath;

    file = this.getFile(file);
    if (!file)
      return;
    if (file.isFile()) {
      if (/\.js$/i.test(file.leafName))
        this.loadScript(file, null, this.dirToken);
      else if (/\.xul$/i.test(file.leafName))
        this.loadOverlay(file, null, this.dirToken);
      else
        this.log("File '" + this.path + "' does not have a valid .js or .xul extension.",
                 "userChrome.import");
    }
    else if (file.isDirectory())
      this.importFolder(file);
    else
      this.log("File '" + this.path + "' is neither a file nor a directory.",
               "userChrome.import");
  },

  loadScript: function(aFile, aFolder, aRelDirToken) {
    setTimeout(function() {
      Services.scriptloader.loadSubScript(userChrome.getURLSpecFromFile(aFile),
                                          null, // defaults to the global object of the caller.
                                          userChrome.charSet);

      userChrome.log(aRelDirToken ? ("[" + aRelDirToken + "]/" +
                                      (aFolder && aFolder != "*" ? aFolder + "/" : "") +
                                      aFile.leafName) :
                                    aFile.path,
                     "userChrome.loadScript");
    }, 0);
  },

  // Due to bug 330458, an overlay must finish before another can be
  // called, otherwise neither are successful.  Implement an observer; if
  // busy try again.
  loadOverlay: function(aFile, aFolder, aRelDirToken) {
    if (userChrome.Observer.queued) {
      setTimeout(userChrome.loadOverlay, userChrome.overlayPollDelay, aFile, aFolder, aRelDirToken);
      return;
    }

    let fileUrl = userChrome.getURLSpecFromFile(aFile);
//    userChrome.log("aRelDirToken:aFile.leafName:aFile.path:fileUrl - "+
//                     aRelDirToken+":"+aFile.leafName+":"+aFile.path+":"+fileUrl,
//                   "userChrome.loadOverlay");
//    userChrome.log("queue fileUrl - "+
//                   (aRelDirToken ? ("[" + aRelDirToken + "]/" +
//                                     (aFolder && aFolder != "*" ? aFolder + "/" : "") +
//                                     aFile.leafName) :
//                                   aFile.path),
//                   "userChrome.loadOverlay");
    userChrome.Observer.queued = fileUrl;
    document.loadOverlay(fileUrl, userChrome.Observer);
  },

  // Include all files ending in .js and .xul from passed folder.
  importFolder: function(aFolder) {
    let files = aFolder.directoryEntries
                       .QueryInterface(Components.interfaces.nsISimpleEnumerator);

    while (files.hasMoreElements()) {
      let file = files.getNext().QueryInterface(Components.interfaces.nsIFile);
      if (/\.js$/i.test(file.leafName) && file.leafName != "userChrome.js")
        this.loadScript(file, this.path, this.dirToken);
      else if (/\.xul$/i.test(file.leafName))
        this.loadOverlay(file, this.path, this.dirToken);
    }
  },

  getFile: function(aPath, aRelDirToken) {
      try {
        let file = Components.classes["@mozilla.org/file/local;1"]
                             .createInstance(Components.interfaces.nsIFile);
        file.initWithPath(aPath);
        // Bad file doesn't throw on initWithPath, need to test.
        if (file.exists())
          return file;
        this.log("Invalid file '" + this.path + (this.dirToken ?
                   ("' or file not found in directory with token '" + this.dirToken) :
                   "") + "' or other access error.",
                 "userChrome.getFile");
      }
      catch (e) {
        // Bad folder throws on initWithPath.
        this.log("Invalid folder '" + this.path + (this.dirToken ?
                   ("' or folder not found in directory with token '" + this.dirToken) :
                   "") + "' or other access error.",
                 "userChrome.getFile");
      }

    return null;
  },

  getAbsoluteFile: function(aRelDirToken) {
    try {
      let absDir = Services.dirsvc.get(aRelDirToken, Components.interfaces.nsIFile);
      return absDir;
    }
    catch (e) {
      this.log("Invalid directory name token '" + this.dirToken +
                 "' or directory cannot be accessed.",
               "userChrome.getAbsoluteFile");
      return null;
    }
  },

  getURLSpecFromFile: Services.io.getProtocolHandler("file")
                                 .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
                                 .getURLSpecFromFile,

  get dateFormat() {
    if (!this._dateFormat)
      this._dateFormat = "%Y-%m-%d %H:%M:%S";
    return this._dateFormat;
  },

  set dateFormat(format) {
    this._dateFormat = format;
  },

  get date() {
    let date = new Date();
    return date.toLocaleFormat(this.dateFormat);
  },

  set charSet(val) {
    this._charSet = val;
  },

  get charSet() {
    if (!this._charSet)
      this._charSet = "UTF-8"; // use "UTF-8"; defaults to ascii if null.
    return this._charSet;
  }

};
