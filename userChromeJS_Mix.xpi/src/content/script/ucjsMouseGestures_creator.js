var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

var checkSupport = (location.protocol !== 'chrome:');

MouseGestures = {
    template: "bG9jYXRpb24gPT0gImNocm9tZTovL2Jyb3dzZXIvY29udGVudC9icm93c2VyLnh1bCIgJiYgKGZ1bmN0aW9uICgpIHsKCXVjanNNb3VzZUdlc3R1cmVzID0gewoJCWxhc3RYOiAwLAoJCWxhc3RZOiAwLAoJCXNvdXJjZU5vZGU6ICIiLAoJCWRpcmVjdGlvbkNoYWluOiAiIiwKCQlpc01vdXNlRG93bkw6IGZhbHNlLAoJCWlzTW91c2VEb3duUjogZmFsc2UsCgkJaGlkZUZpcmVDb250ZXh0OiBmYWxzZSwKCQlzaG91bGRGaXJlQ29udGV4dDogZmFsc2UsCgkJR0VTVFVSRVM6IHt9LAoJCWluaXQ6IGZ1bmN0aW9uICgpIHsKCQkJdmFyIHNlbGYgPSB0aGlzOwoJCQlbIm1vdXNlZG93biIsICJtb3VzZW1vdmUiLCAibW91c2V1cCIsICJjb250ZXh0bWVudSIsICJET01Nb3VzZVNjcm9sbCIsICJkcmFnZW5kIl0uZm9yRWFjaChmdW5jdGlvbiAodHlwZSkgewoJCQkJZ0Jyb3dzZXIubVBhbmVsQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgc2VsZiwgdHJ1ZSk7CgkJCX0pOwoJCQl3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigidW5sb2FkIiwgZnVuY3Rpb24gKCkgewoJCQkJWyJtb3VzZWRvd24iLCAibW91c2Vtb3ZlIiwgIm1vdXNldXAiLCAiY29udGV4dG1lbnUiLCAiRE9NTW91c2VTY3JvbGwiLCAiZHJhZ2VuZCJdLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHsKCQkJCQlnQnJvd3Nlci5tUGFuZWxDb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBzZWxmLCB0cnVlKTsKCQkJCX0pOwoJCQl9LCBmYWxzZSk7CgkJfSwKCQloYW5kbGVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7CgkJCXN3aXRjaCAoZXZlbnQudHlwZSkgewoJCQljYXNlICJtb3VzZWRvd24iOgoJCQkJaWYoL29iamVjdHxlbWJlZC9pLnRlc3QoZXZlbnQudGFyZ2V0LmxvY2FsTmFtZSkpIHJldHVybjsKCQkJCWlmIChldmVudC5idXR0b24gPT0gMikgewoJCQkJCXRoaXMuc291cmNlTm9kZSA9IGV2ZW50LnRhcmdldDsKCQkJCQl0aGlzLmlzTW91c2VEb3duUiA9IHRydWU7CgkJCQkJdGhpcy5oaWRlRmlyZUNvbnRleHQgPSBmYWxzZTsKCQkJCQlbdGhpcy5sYXN0WCwgdGhpcy5sYXN0WSwgdGhpcy5kaXJlY3Rpb25DaGFpbl0gPSBbZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSwgIiJdOwoJCQkJfQoJCQkJaWYgKGV2ZW50LmJ1dHRvbiA9PSAyICYmIHRoaXMuaXNNb3VzZURvd25MKSB7CgkJCQkJdGhpcy5pc01vdXNlRG93blIgPSBmYWxzZTsKCQkJCQl0aGlzLnNob3VsZEZpcmVDb250ZXh0ID0gZmFsc2U7CgkJCQkJdGhpcy5oaWRlRmlyZUNvbnRleHQgPSB0cnVlOwoJCQkJCXRoaXMuZGlyZWN0aW9uQ2hhaW4gPSAiTD5SIjsKCQkJCQl0aGlzLnN0b3BHZXN0dXJlKGV2ZW50KTsKCQkJCX0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDApIHsKCQkJCQl0aGlzLmlzTW91c2VEb3duTCA9IHRydWU7CgkJCQkJaWYgKHRoaXMuaXNNb3VzZURvd25SKSB7CgkJCQkJCXRoaXMuaXNNb3VzZURvd25MID0gZmFsc2U7CgkJCQkJCXRoaXMuc2hvdWxkRmlyZUNvbnRleHQgPSBmYWxzZTsKCQkJCQkJdGhpcy5oaWRlRmlyZUNvbnRleHQgPSB0cnVlOwoJCQkJCQl0aGlzLmRpcmVjdGlvbkNoYWluID0gIkw8UiI7CgkJCQkJCXRoaXMuc3RvcEdlc3R1cmUoZXZlbnQpOwoJCQkJCX0KCQkJCX0KCQkJCWJyZWFrOwoJCQljYXNlICJtb3VzZW1vdmUiOgoJCQkJaWYgKHRoaXMuaXNNb3VzZURvd25SKSB7CgkJCQkJdGhpcy5oaWRlRmlyZUNvbnRleHQgPSB0cnVlOwoJCQkJCXZhciBbc3ViWCwgc3ViWV0gPSBbZXZlbnQuc2NyZWVuWCAtIHRoaXMubGFzdFgsIGV2ZW50LnNjcmVlblkgLSB0aGlzLmxhc3RZXTsKCQkJCQl2YXIgW2Rpc3RYLCBkaXN0WV0gPSBbKHN1YlggPiAwID8gc3ViWCA6ICgtc3ViWCkpLCAoc3ViWSA+IDAgPyBzdWJZIDogKC1zdWJZKSldOwoJCQkJCXZhciBkaXJlY3Rpb247CgkJCQkJaWYgKGRpc3RYIDwgMTAgJiYgZGlzdFkgPCAxMCkgcmV0dXJuOwoJCQkJCWlmIChkaXN0WCA+IGRpc3RZKSBkaXJlY3Rpb24gPSBzdWJYIDwgMCA/ICJMIiA6ICJSIjsKCQkJCQllbHNlIGRpcmVjdGlvbiA9IHN1YlkgPCAwID8gIlUiIDogIkQiOwoJCQkJCWlmIChkaXJlY3Rpb24gIT0gdGhpcy5kaXJlY3Rpb25DaGFpbi5jaGFyQXQodGhpcy5kaXJlY3Rpb25DaGFpbi5sZW5ndGggLSAxKSkgewoJCQkJCQl0aGlzLmRpcmVjdGlvbkNoYWluICs9IGRpcmVjdGlvbjsKCQkJCQkJWFVMQnJvd3NlcldpbmRvdy5zdGF0dXNUZXh0RmllbGQubGFiZWwgPSB0aGlzLkdFU1RVUkVTW3RoaXMuZGlyZWN0aW9uQ2hhaW5dID8gIuaJi+WKvzogIiArIHRoaXMuZGlyZWN0aW9uQ2hhaW4gKyAiICIgKyB0aGlzLkdFU1RVUkVTW3RoaXMuZGlyZWN0aW9uQ2hhaW5dLm5hbWUgOiAi5pyq55+l5omL5Yq/OiIgKyB0aGlzLmRpcmVjdGlvbkNoYWluOwoJCQkJCX0KCQkJCQl0aGlzLmxhc3RYID0gZXZlbnQuc2NyZWVuWDsKCQkJCQl0aGlzLmxhc3RZID0gZXZlbnQuc2NyZWVuWTsKCQkJCX0KCQkJCWJyZWFrOwoJCQljYXNlICJtb3VzZXVwIjoKCQkJCWlmIChldmVudC5jdHJsS2V5ICYmIGV2ZW50LmJ1dHRvbiA9PSAyKSB7CgkJCQkJdGhpcy5pc01vdXNlRG93bkwgPSBmYWxzZTsKCQkJCQl0aGlzLmlzTW91c2VEb3duUiA9IGZhbHNlOwoJCQkJCXRoaXMuc2hvdWxkRmlyZUNvbnRleHQgPSBmYWxzZTsKCQkJCQl0aGlzLmhpZGVGaXJlQ29udGV4dCA9IGZhbHNlOwoJCQkJCXRoaXMuZGlyZWN0aW9uQ2hhaW4gPSAiIjsKCQkJCQlldmVudC5wcmV2ZW50RGVmYXVsdCgpOwoJCQkJCVhVTEJyb3dzZXJXaW5kb3cuc3RhdHVzVGV4dEZpZWxkLmxhYmVsID0gIuWPlua2iOaJi+WKvyI7CgkJCQkJYnJlYWs7CgkJCQl9CgkJCQlpZiAodGhpcy5pc01vdXNlRG93blIgJiYgZXZlbnQuYnV0dG9uID09IDIpIHsKCQkJCQlpZiAodGhpcy5kaXJlY3Rpb25DaGFpbikgdGhpcy5zaG91bGRGaXJlQ29udGV4dCA9IGZhbHNlOwoJCQkJCXRoaXMuaXNNb3VzZURvd25SID0gZmFsc2U7CgkJCQkJdGhpcy5kaXJlY3Rpb25DaGFpbiAmJiB0aGlzLnN0b3BHZXN0dXJlKGV2ZW50KTsKCQkJCX0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDAgJiYgdGhpcy5pc01vdXNlRG93bkwpIHsKCQkJCQl0aGlzLmlzTW91c2VEb3duTCA9IGZhbHNlOwoJCQkJCXRoaXMuc2hvdWxkRmlyZUNvbnRleHQgPSBmYWxzZTsKCQkJCX0KCQkJCWJyZWFrOwoJCQljYXNlICJjb250ZXh0bWVudSI6CgkJCQlpZiAodGhpcy5pc01vdXNlRG93bkwgfHwgdGhpcy5pc01vdXNlRG93blIgfHwgdGhpcy5oaWRlRmlyZUNvbnRleHQpIHsKCQkJCQl2YXIgcHJlZiA9IENvbXBvbmVudHMuY2xhc3Nlc1siQG1vemlsbGEub3JnL3ByZWZlcmVuY2VzLXNlcnZpY2U7MSJdLmdldFNlcnZpY2UoQ29tcG9uZW50cy5pbnRlcmZhY2VzLm5zSVByZWZTZXJ2aWNlKTsKCQkJCQl2YXIgY29udGV4dG1lbnUgPSBwcmVmLmdldEJvb2xQcmVmKCJkb20uZXZlbnQuY29udGV4dG1lbnUuZW5hYmxlZCIpOwoJCQkJCXByZWYuc2V0Qm9vbFByZWYoImRvbS5ldmVudC5jb250ZXh0bWVudS5lbmFibGVkIiwgdHJ1ZSk7CgkJCQkJc2V0VGltZW91dChmdW5jdGlvbiAoKSB7CgkJCQkJCXByZWYuc2V0Qm9vbFByZWYoImRvbS5ldmVudC5jb250ZXh0bWVudS5lbmFibGVkIiwgY29udGV4dG1lbnUpOwoJCQkJCX0sIDEwKTsKCQkJCQlldmVudC5wcmV2ZW50RGVmYXVsdCgpOwoJCQkJCWV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOwoJCQkJCXRoaXMuc2hvdWxkRmlyZUNvbnRleHQgPSB0cnVlOwoJCQkJCXRoaXMuaGlkZUZpcmVDb250ZXh0ID0gZmFsc2U7CgkJCQl9CgkJCQlicmVhazsKCQkJY2FzZSAiRE9NTW91c2VTY3JvbGwiOgoJCQkJaWYgKHRoaXMuaXNNb3VzZURvd25SKSB7CgkJCQkJZXZlbnQucHJldmVudERlZmF1bHQoKTsKCQkJCQlldmVudC5zdG9wUHJvcGFnYXRpb24oKTsKCQkJCQl0aGlzLnNob3VsZEZpcmVDb250ZXh0ID0gZmFsc2U7CgkJCQkJdGhpcy5oaWRlRmlyZUNvbnRleHQgPSB0cnVlOwoJCQkJCXRoaXMuZGlyZWN0aW9uQ2hhaW4gPSAiVyIgKyAoZXZlbnQuZGV0YWlsID4gMCA/ICIrIiA6ICItIik7CgkJCQkJdGhpcy5zdG9wR2VzdHVyZShldmVudCk7CgkJCQl9CgkJCQlicmVhazsKCQkJY2FzZSAiZHJhZ2VuZCI6CgkJCQl0aGlzLmlzTW91c2VEb3duTCA9IGZhbHNlOwoJCQl9CgkJfSwKCQlzdG9wR2VzdHVyZTogZnVuY3Rpb24gKGV2ZW50KSB7CgkJCSh0aGlzLkdFU1RVUkVTW3RoaXMuZGlyZWN0aW9uQ2hhaW5dID8gdGhpcy5HRVNUVVJFU1t0aGlzLmRpcmVjdGlvbkNoYWluXS5jbWQodGhpcywgZXZlbnQpICYgKFhVTEJyb3dzZXJXaW5kb3cuc3RhdHVzVGV4dEZpZWxkLmxhYmVsID0gIiIpIDogKFhVTEJyb3dzZXJXaW5kb3cuc3RhdHVzVGV4dEZpZWxkLmxhYmVsID0gIuacquefpeaJi+WKvzoiICsgdGhpcy5kaXJlY3Rpb25DaGFpbikpICYgKHRoaXMuZGlyZWN0aW9uQ2hhaW4gPSAiIik7CgkJfQoJfTsKCXVjanNNb3VzZUdlc3R1cmVzLmluaXQoKQp9KSgp",
    install_rdf: "PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxSREYgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmVtPSJodHRwOi8vd3d3Lm1vemlsbGEub3JnLzIwMDQvZW0tcmRmIyI+Cgk8RGVzY3JpcHRpb24gYWJvdXQ9InVybjptb3ppbGxhOmluc3RhbGwtbWFuaWZlc3QiPgoJCTxlbTppZD5Nb3VzZUdlc3R1cmVzQHppeXVuZmVpPC9lbTppZD4KCQk8ZW06dmVyc2lvbj4xLjA8L2VtOnZlcnNpb24+CgkJPGVtOnRhcmdldEFwcGxpY2F0aW9uPgoJCQk8RGVzY3JpcHRpb24+CgkJCQk8ZW06aWQ+e2VjODAzMGY3LWMyMGEtNDY0Zi05YjBlLTEzYTNhOWU5NzM4NH08L2VtOmlkPgoJCQkJPGVtOm1pblZlcnNpb24+MS4wPC9lbTptaW5WZXJzaW9uPgoJCQkJPGVtOm1heFZlcnNpb24+MTAuKjwvZW06bWF4VmVyc2lvbj4KCQkJPC9EZXNjcmlwdGlvbj4KCQk8L2VtOnRhcmdldEFwcGxpY2F0aW9uPgoJCTxlbTpuYW1lPk1vdXNlR2VzdHVyZXM8L2VtOm5hbWU+CgkJPGVtOmRlc2NyaXB0aW9uPk1vdXNlR2VzdHVyZXM8L2VtOmRlc2NyaXB0aW9uPgoJCTxlbTpjcmVhdG9yPue0q+S6kemjnjwvZW06Y3JlYXRvcj4KCTwvRGVzY3JpcHRpb24+CjwvUkRGPg==",
    chrome_manifest: "Y29udGVudCBNb3VzZUdlc3R1cmVzIC4vCm92ZXJsYXkgY2hyb21lOi8vYnJvd3Nlci9jb250ZW50L2Jyb3dzZXIueHVsIGNocm9tZTovL01vdXNlR2VzdHVyZXMvY29udGVudC9vdmVybGF5Lnh1bA==",
    overlay_xul: "PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxvdmVybGF5IHhtbG5zPSJodHRwOi8vd3d3Lm1vemlsbGEub3JnL2tleW1hc3Rlci9nYXRla2VlcGVyL3RoZXJlLmlzLm9ubHkueHVsIj4KCTxzY3JpcHQ+CgkJPCFbQ0RBVEFbIAp3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigibG9hZCIsZnVuY3Rpb24oKXsKLy8vCn0sZmFsc2UpCgkJXV0+Cgk8L3NjcmlwdD4KPC9vdmVybGF5Pg==",
    line: "CQkJCQlpZighIX5jb250ZW50LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC50b1N0cmluZygpLmluZGV4T2YoIkhUTUwiKSl7CgkJCQkJCXZhciBkb2NmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpOwoJCQkJCQljb250ZW50LnhkVHJhaWxBcmVhID0gY29udGVudC54ZFRyYWlsQXJlYSB8fCBjb250ZW50LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiLCAieGRUcmFpbEFyZWEiKSk7CgkJCQkJCWlmIChkaXJlY3Rpb24gPT0gIlIiKSB7CgkJCQkJCQlmb3IgKHZhciBpID0gdGhpcy5sYXN0WCwgaiA9IHRoaXMubGFzdFk7IGkgPD0gZXZlbnQuc2NyZWVuWDsgaSArPSAyKQoJCQkJCQkJZG9jZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiLCAieGRUcmFpbERvdCIpKS5zdHlsZS5jc3NUZXh0ID0gIndpZHRoOjJweDsgaGVpZ2h0OjJweDsgYmFja2dyb3VuZDogbm9uZSByZXBlYXQgc2Nyb2xsIDAlIDAlICMzM2ZmMzM7IGJvcmRlcjogMHB4IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgei1pbmRleDogMjE0NzQ4MzY0NzsgbGVmdDoiICsgKGNvbnRlbnQucGFnZVhPZmZzZXQgKyBpIC0gY29udGVudC5tb3pJbm5lclNjcmVlblgpICsgInB4O3RvcDoiICsgKGNvbnRlbnQucGFnZVlPZmZzZXQgKyAoc3ViWSA8IDAgPyAoaiAtPSAyICogTWF0aC5hYnMoc3ViWSAvIHN1YlgpKSA6IChqICs9IDIgKiBNYXRoLmFicyhzdWJZIC8gc3ViWCkpKSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5ZKSArICJweDsiOwoJCQkJCQl9CgkJCQkJCWlmIChkaXJlY3Rpb24gPT0gIkwiKSB7CgkJCQkJCQlmb3IgKHZhciBpID0gdGhpcy5sYXN0WCwgaiA9IHRoaXMubGFzdFk7IGkgPj0gZXZlbnQuc2NyZWVuWDsgaSAtPSAyKQoJCQkJCQkJZG9jZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiLCAieGRUcmFpbERvdCIpKS5zdHlsZS5jc3NUZXh0ID0gIndpZHRoOjJweDsgaGVpZ2h0OjJweDsgYmFja2dyb3VuZDogbm9uZSByZXBlYXQgc2Nyb2xsIDAlIDAlICMzM2ZmMzM7IGJvcmRlcjogMHB4IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgei1pbmRleDogMjE0NzQ4MzY0NzsgbGVmdDoiICsgKGNvbnRlbnQucGFnZVhPZmZzZXQgKyBpIC0gY29udGVudC5tb3pJbm5lclNjcmVlblgpICsgInB4O3RvcDoiICsgKGNvbnRlbnQucGFnZVlPZmZzZXQgKyAoc3ViWSA8IDAgPyAoaiAtPSAyICogTWF0aC5hYnMoc3ViWSAvIHN1YlgpKSA6IChqICs9IDIgKiBNYXRoLmFicyhzdWJZIC8gc3ViWCkpKSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5ZKSArICJweDsiOwoJCQkJCQl9CgkJCQkJCWlmIChkaXJlY3Rpb24gPT0gIlUiKSB7CgkJCQkJCQlmb3IgKHZhciBpID0gdGhpcy5sYXN0WSwgaiA9IHRoaXMubGFzdFg7IGkgPj0gZXZlbnQuc2NyZWVuWTsgaSAtPSAyKQoJCQkJCQkJZG9jZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiLCAieGRUcmFpbERvdCIpKS5zdHlsZS5jc3NUZXh0ID0gIndpZHRoOjJweDsgaGVpZ2h0OjJweDsgYmFja2dyb3VuZDogbm9uZSByZXBlYXQgc2Nyb2xsIDAlIDAlICMzM2ZmMzM7IGJvcmRlcjogMHB4IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgei1pbmRleDogMjE0NzQ4MzY0NzsgbGVmdDoiICsgKGNvbnRlbnQucGFnZVhPZmZzZXQgKyAoc3ViWCA8IDAgPyAoaiAtPSAyICogTWF0aC5hYnMoc3ViWCAvIHN1YlkpKSA6IChqICs9IDIgKiBNYXRoLmFicyhzdWJYIC8gc3ViWSkpKSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5YKSArICJweDt0b3A6IiArIChjb250ZW50LnBhZ2VZT2Zmc2V0ICsgaSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5ZKSArICJweDsiOwoJCQkJCQl9CgkJCQkJCWlmIChkaXJlY3Rpb24gPT0gIkQiKSB7CgkJCQkJCQlmb3IgKHZhciBpID0gdGhpcy5sYXN0WSwgaiA9IHRoaXMubGFzdFg7IGkgPD0gZXZlbnQuc2NyZWVuWTsgaSArPSAyKQoJCQkJCQkJZG9jZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiLCAieGRUcmFpbERvdCIpKS5zdHlsZS5jc3NUZXh0ID0gIndpZHRoOjJweDsgaGVpZ2h0OjJweDsgYmFja2dyb3VuZDogbm9uZSByZXBlYXQgc2Nyb2xsIDAlIDAlICMzM2ZmMzM7IGJvcmRlcjogMHB4IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgei1pbmRleDogMjE0NzQ4MzY0NzsgbGVmdDoiICsgKGNvbnRlbnQucGFnZVhPZmZzZXQgKyAoc3ViWCA8IDAgPyAoaiAtPSAyICogTWF0aC5hYnMoc3ViWCAvIHN1YlkpKSA6IChqICs9IDIgKiBNYXRoLmFicyhzdWJYIC8gc3ViWSkpKSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5YKSArICJweDt0b3A6IiArIChjb250ZW50LnBhZ2VZT2Zmc2V0ICsgaSAtIGNvbnRlbnQubW96SW5uZXJTY3JlZW5ZKSArICJweDsiOwoJCQkJCQl9CgkJCQkJCWNvbnRlbnQueGRUcmFpbEFyZWEuYXBwZW5kQ2hpbGQoZG9jZnJhZyk7CgkJCQkJfQoJCQkJCQ==",

    selectedgesturesChain: [],
    openChrome: function() {
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).reveal();
        } catch (e) {
            alert("about:config中signed.applets.codebase_principal_support禁止了该行为");
        }
    },
    doNotGenerate: function() {
        if ($("#doNotGenerate:checked").length) {
            $("#escapeunicode").parent().hide();
            $(".colorpicker-wrap").css("display", "none");
            $("#showline").parent().hide();
            $("#deleteScript").hide();
            $("#generateScript").hide();
            $("#gesturesChain").parent().hide();
            $("#showComment").parent().hide();
            if ($("#gesturesCommand").val()) {
                $("#MouseGesturesScript").val(js_beautify(MouseGestures[$("#gesturesCommand").val()].cmd.toString().replace(/^function.+\n|\n.$/g, "").replace(/^\s\s\s\s/mg, "")));
                $("#MouseGesturesScriptLineNum").text("行数:" + (($("#MouseGesturesScript").val().match(/\n/g) || "").length + 1));
            }
        } else {
            $("#escapeunicode").parent().show();
            $(".colorpicker-wrap").css("display", "inline-block");
            $("#showline").parent().show();
            $("#deleteScript").show();
            $("#generateScript").show();
            $("#gesturesChain").parent().show();
            $("#showComment").parent().show();
        }
    },
    onChange: function() {
        if (this.selectedgesturesChain[$("#gesturesChain").val()]) {
            $("#deleteScript").attr("disabled", false);
            [i
                for (i in $("#gesturesCommand")[0].options)
                    if ($("#gesturesCommand")[0].options[i].textContent == MouseGestures.selectedgesturesChain[$("#gesturesChain").val()].match(/name:"(.+)"/)[1])
            ][0].selected = 1;
        } else {
            $("#deleteScript").attr("disabled", true);
            if (!!~$("#gesturesCommand")[0].selectedIndex && $("#gesturesCommand")[0].options[$("#gesturesCommand")[0].selectedIndex].disabled) {
                $("#gesturesCommand")[0].selectedIndex = -1;
            }
        }
    },
    saveUC: function() {
        var data = $("#MouseGesturesScript").val();
        if (!data) {
            alert("请先选择");
        }
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("about:config中 signed.applets.codebase_principal_support 禁止了该行为");
            return;
        }

        var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile);
        file.append("MouseGestures.uc.js");

        var suConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        suConverter.charset = 'UTF-8';
        data = suConverter.ConvertFromUnicode(data);

        var foStream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
        foStream.write(data, data.length);
        foStream.close();

        alert('已经成功保存 "' + file.leafName + '" 到 chrome 目录下');
    },
    makeXPI: function() {
        if (!$("#MouseGesturesScript").val()) {
            alert("请先选择");
        }
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("about:config中 signed.applets.codebase_principal_support 禁止了该行为");
            return;
        }
        var zipW = new Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter")();
        var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("DeskP", Components.interfaces.nsILocalFile);
        file.append("MouseGestures.xpi");
        zipW.open(file, 44);
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        zipW.addEntryStream("install.rdf", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.install_rdf)))), false);
        zipW.addEntryStream("chrome.manifest", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.chrome_manifest)))), false);
        zipW.addEntryStream("overlay.xul", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.overlay_xul))).replace(/\/\/\//g, $("#MouseGesturesScript").val())), false);
        zipW.close();

        file.reveal();
    },
    copyScript: function() {
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString($("#MouseGesturesScript").val());
        } catch (e) {
            alert("about:config中signed.applets.codebase_principal_support禁止了该行为");
        }
    },
    runScript: function() {
        if (navigator.userAgent.match(/rv:(\d)/)[1] > 1) {
            alert("Firefox 4.0及其以上版本不允许网页操作自己的浏览器");
            return;
        }
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("about:config中signed.applets.codebase_principal_support禁止了该行为");
            return;
        }
        try {
            if ((!$("#doNotGenerate:checked").length) && !!~$("#MouseGesturesScript").val().indexOf("ucjsMouseGestures")) {
                with(Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow()) {
                    eval('["mousedown","mousemove","mouseup","contextmenu","DOMMouseScroll"].forEach(function(type){Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow().gBrowser.mPanelContainer.removeEventListener(type,Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow().ucjsMouseGestures ,type=="contextmenu")})')
                }
            }
            with(Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow()) {
                eval($("#MouseGesturesScript").val())
            }
        } catch (e) {
            alert("该脚本无法正常运行");
        }
    },
    escape: function() {
        $("#MouseGesturesScript").val($("#escapeunicode:checked").length ? $("#MouseGesturesScript").val().split("\n").map(function(line) {
            return /^\s+\/\//.test(line) ? line : line.replace(/[^\u0000-\u00FF]/g, function($0) {
                return "\\u" + $0.charCodeAt(0).toString(16);
            })
        }).join("\n") : $("#MouseGesturesScript").val());
    },
    generateScript: function(del, changeEscape) {
        if (!changeEscape) {
            $("#gesturesChain")[0].selectedIndex = $("#gesturesChain")[0].selectedIndex < 0 ? 0 : $("#gesturesChain")[0].selectedIndex;
            if (del) {
                if (!MouseGestures.selectedgesturesChain[$("#gesturesChain").val()])
                    return;
                var item = [node
                    for (node of $("#gesturesCommand")[0].options)
                        if (node.textContent == MouseGestures.selectedgesturesChain[$("#gesturesChain").val()].match(/name:"(.+)"/)[1])
                ][0];
                item.disabled = 0;
                item.style.backgroundColor = "";
                $("#deleteScript").attr("disabled", true);
                $("#gesturesChain")[0].options[$("#gesturesChain")[0].selectedIndex].style.backgroundColor = "";
                this.selectedgesturesChain[$("#gesturesChain").val()] = '';
            } else {
                if ($("#gesturesCommand").val()) {
                    if (this.selectedgesturesChain[$("#gesturesChain").val()]) {
                        var item = [node
                            for (node of $("#gesturesCommand")[0].options)
                                if (node.textContent == MouseGestures.selectedgesturesChain[$("#gesturesChain").val()].match(/name:"(.+)"/)[1])
                        ][0];
                        item.disabled = 0;
                        item.style.backgroundColor = "";
                    }
                    this.selectedgesturesChain[$("#gesturesChain").val()] = '{\nname:"' + this[$("#gesturesCommand").val()].name + '",\ncmd:' + this[$("#gesturesCommand").val()].cmd + '\n},'
                    $("#gesturesChain")[0].options[$("#gesturesChain")[0].selectedIndex].style.backgroundColor = "pink";
                    $("#gesturesCommand")[0].options[$("#gesturesCommand")[0].selectedIndex].style.backgroundColor = "pink";
                    $($("#gesturesCommand")[0].options[$("#gesturesCommand")[0].selectedIndex]).attr("disabled", "true");
                    $("#gesturesChain")[0].selectedIndex++;
                    $("#gesturesCommand")[0].selectedIndex++;
                    if (!!~$("#gesturesCommand")[0].selectedIndex && $($("#gesturesCommand")[0].options[$("#gesturesCommand")[0].selectedIndex]).attr("disabled")) {
                        $("#gesturesCommand")[0].selectedIndex = -1;
                    }
                } else {
                    return;
                }
            }
        }
        $("#MouseGesturesScript").val((!$("#showline:checked").length ? decodeURIComponent(escape(atob(this.template))) : decodeURIComponent(escape(atob(this.template))).replace(/^\s+(?=if \(direction)/m, decodeURIComponent(escape(atob(this.line)))).replace(/case "mouseup":/, 'case "mouseup":\n\t\t\t\tif(content.xdTrailArea) {\n\t\t\t\t\tcontent.xdTrailArea.parentNode.removeChild(content.xdTrailArea);\n\t\t\t\t\tcontent.xdTrailArea = content.document.documentElement.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "xdTrailArea"));\n\t\t\t\t}').replace(/33ff33/g, $("#picker").val())).replace("{},", js_beautify("{" + [($("#showComment:checked").length ? ('\n//' + this.selectedgesturesChain[i].match(/name:"(.+)"/)[1]) : "") + '\n"' + i + '":' + this.selectedgesturesChain[i]
            for (i in this.selectedgesturesChain)
                if (this.selectedgesturesChain[i])
        ].join("") + "},").replace(/^/mg, "\t\t").replace(/^\s+{/, "{")))
        MouseGestures.escape();
        $("#MouseGesturesScriptLineNum").text("行数:" + (($("#MouseGesturesScript").val().match(/\n/g) || "").length + 1));
    },
    BrowserOpenTab: {
        name: "打开新标签",
        cmd: function() {
            BrowserOpenTab();
        }
    },
    BrowserHome: {
        name: "打开主页",
        cmd: function() {
            BrowserHome();
        }
    },
    newTabOpenLink: {
        name: "新标签打开链接(前台)",
        cmd: function(self) {
            gBrowser.selectedTab = gBrowser.addTab(self.sourceNode.href || self.sourceNode.parentNode.href);
        }
    },
    newTabOpenLinkBG: {
        name: "新标签打开链接(后台)",
        cmd: function(self) {
            gBrowser.addTab(self.sourceNode.href || self.sourceNode.parentNode.href);
        }
    },
    newTabOpenURL: {
        name: "新标签打开指定网址(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab("www.abc.com");
        }
    },
    newTabOpenURLBG: {
        name: "新标签打开指定网址(后台)",
        cmd: function() {
            gBrowser.addTab("www.abc.com");
        }
    },
    removeCurrentTab: {
        name: "关闭当前标签",
        cmd: function() {
            gBrowser.removeCurrentTab();
        }
    },
    closePrevTab: {
        name: "关闭左边的标签页",
        cmd: function() {
            gBrowser.visibleTabs.indexOf(gBrowser.mCurrentTab) == 0 || gBrowser.removeTab(gBrowser.visibleTabs[gBrowser.visibleTabs.indexOf(gBrowser.mCurrentTab) - 1]);
        }
    },
    closeNextTab: {
        name: "关闭右边的标签页",
        cmd: function() {
            gBrowser.visibleTabs.indexOf(gBrowser.mCurrentTab) + 1 < gBrowser.visibleTabs.length && gBrowser.removeTab(gBrowser.visibleTabs[gBrowser.visibleTabs.indexOf(gBrowser.mCurrentTab) + 1]);
        }
    },
    removeAllTabsBut: {
        name: "关闭其他标签页",
        cmd: function() {
            gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);
        }
    },
    removeAllTabViewsTabsBut: {
        name: "关闭其他标签页(包括其他标签页组)",
        cmd: function() {
            Array.filter(gBrowser.mTabs, function(tab) {
                return tab != gBrowser.mCurrentTab;
            }).forEach(function(tab) {
                gBrowser.removeTab(tab);
            })
        }
    },
    removeAllTabs: {
        name: "关闭所有标签页",
        cmd: function() {
            gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);
            gBrowser.removeCurrentTab();
        }
    },
    removeAllTabViewsTabs: {
        name: "关闭所有标签页(包括其他标签页组)",
        cmd: function() {
            while (gBrowser.mTabs.length > 1)
                gBrowser.removeTab(gBrowser.mTabs[0]);
            gBrowser.removeCurrentTab();
        }
    },
    undoCloseTab: {
        name: "恢复关闭的标签页",
        cmd: function() {
            undoCloseTab();
        }
    },
    PrevTab: {
        name: "激活左边的标签页",
        cmd: function() {
            gBrowser.tabContainer.advanceSelectedTab(-1, true);
        }
    },
    PrevTabViewTab: {
        name: "激活左边的标签页(包括其他标签页组)",
        cmd: function() {
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.removeAttribute("hidden");
            })
            gBrowser.tabContainer.advanceSelectedTab(-1, true);
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.removeAttribute("hidden");
            })
        }
    },
    NextTab: {
        name: "激活右边的标签页",
        cmd: function() {
            gBrowser.tabContainer.advanceSelectedTab(1, true);
        }
    },
    NextTabViewTab: {
        name: "激活右边的标签页(包括其他标签页组)",
        cmd: function() {
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.removeAttribute("hidden");
            })
            gBrowser.tabContainer.advanceSelectedTab(1, true);
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.removeAttribute("hidden");
            })
        }
    },
    firstTab: {
        name: "激活第一个标签",
        cmd: function() {
            gBrowser.selectedTab = (gBrowser.visibleTabs || gBrowser.mTabs)[0];
        }
    },
    lastTab: {
        name: "激活最后一个标签",
        cmd: function() {
            gBrowser.selectedTab = (gBrowser.visibleTabs || gBrowser.mTabs)[(gBrowser.visibleTabs || gBrowser.mTabs).length - 1];
        }
    },
    reloadTab: {
        name: "刷新当前页面",
        cmd: function() {
            gBrowser.mCurrentBrowser.reload();
        }
    },
    skipCacheReloadTab: {
        name: "跳过缓存刷新当前页面",
        cmd: function() {
            BrowserReloadSkipCache();
        }
    },
    reloadAllTabsBut: {
        name: "刷新其他所有页面",
        cmd: function() {
            Array.forEach(gBrowser.visibleTabs, function(tab) {
                tab == gBrowser.mCurrentBrowser || tab.linkedBrowser.reload();
            })
        }
    },
    reloadAllTabViewsTabsBut: {
        name: "刷新其他所有页面(包括其他标签页组)",
        cmd: function() {
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab == gBrowser.mCurrentBrowser || tab.linkedBrowser.reload();
            })
        }
    },
    reloadAllTabs: {
        name: "刷新所有页面",
        cmd: function() {
            gBrowser.reloadAllTabs();
        }
    },
    reloadAllTabViewsTabs: {
        name: "刷新所有页面(包括其他标签页组)",
        cmd: function() {
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.linkedBrowser.reload();
            })
        }
    },
    BrowserStop: {
        name: "停止载入当前页",
        cmd: function() {
            BrowserStop();
        }
    },
    BrowserStopAll: {
        name: "停止载入所有页",
        cmd: function() {
            Array.map(gBrowser.browsers, function(browser) {
                browser.stop()
            });
        }
    },
    BrowserBack: {
        name: "后退",
        cmd: function() {
            getWebNavigation().canGoBack && getWebNavigation().goBack();
        }
    },
    quickBack: {
        name: "后退到最后",
        cmd: function() {
            getWebNavigation().gotoIndex(0);
        }
    },
    BrowserForward: {
        name: "前进",
        cmd: function() {
            getWebNavigation().canGoForward && getWebNavigation().goForward();
        }
    },
    quickForward: {
        name: "前进到最前",
        cmd: function() {
            getWebNavigation().gotoIndex(getWebNavigation().sessionHistory.count - 1);
        }
    },
    scrollTop: {
        name: "转到页首",
        cmd: function() {
            goDoCommand("cmd_scrollTop");
        }
    },
    scrollTop2: {
        name: "转到页首(强制)",
        cmd: function() {
            content.scrollTo(0, 0);
        }
    },
    scrollBottom: {
        name: "转到页尾",
        cmd: function() {
            goDoCommand("cmd_scrollBottom");
        }
    },
    scrollBottom2: {
        name: "转到页尾(强制)",
        cmd: function() {
            content.scrollTo(0, 1e10);
        }
    },
    scrollByPagesDown: {
        name: "向下滚动一屏",
        cmd: function() {
            content.scrollByPages(1);
        }
    },
    scrollByPagesUp: {
        name: "向上滚动一屏",
        cmd: function() {
            content.scrollByPages(-1);
        }
    },
    doSelectAll: {
        name: "全选",
        cmd: function() {
            goDoCommand("cmd_selectAll");
        }
    },
    doSelectAllAndCopy: {
        name: "复制页面全部文字",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(content.document.documentElement.textContent);
        }
    },
    copySelect: {
        name: "复制选中文字",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(content.getSelection());
        }
    },
    BrowserSearch: {
        name: "搜索框搜索选中文字",
        cmd: function() {
            BrowserSearch.loadSearch(getBrowserSelection(), true);
        }
    },
    baiduSearch: {
        name: "baidu搜索选中文字",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.baidu.com/s?wd=' + getBrowserSelection());
        }
    },
    googleSearch: {
        name: "google搜索选中文字",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(getBrowserSelection()));
        }
    },
    saveSelect: {
        name: "保存选中文字",
        cmd: function() {
            saveImageURL('data:text/plain;charset=UTF-8;base64,' + btoa(unescape(encodeURIComponent(content.getSelection().toString()))), content.document.title + ".txt");
        }
    },
    openSelectLinks: {
        name: "打开选中链接",
        cmd: function() {
            Array.filter(content.document.links, function(link) {
                arguments.callee.uniq = arguments.callee.uniq || [];
                if ((!~arguments.callee.uniq.indexOf(link.toString())) && content.getSelection().containsNode(link, 1)) {
                    arguments.callee.uniq.push(link.toString());
                    return 1;
                }
            }).forEach(function(link) {
                gBrowser.addTab(link.toString());
            })
        }
    },
    copySelectLinks: {
        name: "复制选中链接",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(Array.filter(content.document.links, function(link) {
                arguments.callee.uniq = arguments.callee.uniq || [];
                if ((!~arguments.callee.uniq.indexOf(link.toString())) && content.getSelection().containsNode(link, 1)) {
                    arguments.callee.uniq.push(link.toString());
                    return 1;
                }
            }).map(function(link) {
                return link.toString();
            }).join("\r\n"));
        }
    },
    saveSelectImg: {
        name: "下载选中图片",
        cmd: function() {
            Array.filter(content.document.images, function(image) {
                arguments.callee.uniq = arguments.callee.uniq || [];
                if ((!~arguments.callee.uniq.indexOf(image.src)) && content.getSelection().containsNode(image, 1)) {
                    arguments.callee.uniq.push(image.src);
                    return 1;
                }
            }).forEach(function(image) {
                saveImageURL(image.src, 0, 0, 0, 1);
            })
        }
    },
    deleteSelect: {
        name: "删除选中部分网页",
        cmd: function() {
            content.getSelection().deleteFromDocument(0);
        }
    },
    saveImage: {
        name: "保存图片",
        cmd: function(self) {
            if (self.sourceNode.src) {
                saveImageURL(self.sourceNode.src);
            }
        }
    },
    copyImageURL: {
        name: "复制图片地址",
        cmd: function(self) {
            if (self.sourceNode.src) {
                Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(self.sourceNode.src);
            }
        }
    },
    openImageURL: {
        name: "新标签打开图片",
        cmd: function(self) {
            if (self.sourceNode.src) {
                gBrowser.addTab(self.sourceNode.src);
            }
        }
    },
    searchImageAll: {
        name: "搜索相似图片",
        cmd: function(self) {
            if (self.sourceNode.src) {
                gBrowser.addTab('http://www.tineye.com/search/?pluginver=firefox-1.0&sort=size&order=desc&url=' + encodeURIComponent(self.sourceNode.src));
                gBrowser.addTab('http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=' + encodeURIComponent(self.sourceNode.src));
                gBrowser.addTab('http://www.google.com/searchbyimage?image_url=' + encodeURIComponent(self.sourceNode.src));
                gBrowser.addTab('http://pic.sogou.com/ris?query=' + encodeURIComponent(self.sourceNode.src));
            }
        }
    },
    fanhuajian: {
        name: "繁化简",
        cmd: function() {
            content.document.documentElement.appendChild(content.document.createElement("script")).src = "http://tongwen.openfoundry.org/NewTongWen/tools/bookmarklet_cn2.js";
        }
    },
    jianhuafan: {
        name: "简化繁",
        cmd: function() {
            content.document.documentElement.appendChild(content.document.createElement("script")).src = "http://tongwen.openfoundry.org/NewTongWen/tools/bookmarklet_tw2.js";
        }
    },
    gbToUTF8: {
        name: "页面编码GB互转UTF8",
        cmd: function() {
            BrowserSetForcedCharacterSet(gBrowser.mCurrentBrowser._docShell.charset == 'gbk' ? 'utf-8' : 'gbk');
        }
    },
    baseDir: {
        name: "网址向上一层",
        cmd: function() {
            loadURI(content.location.host + content.location.pathname.replace(/\/[^\/]+\/?$/, ""));
        }
    },
    URLNumUp: {
        name: "URL中的数字递增",
        cmd: function() {
            loadURI(content.location.href.replace(/(\d+)(?=\D*$)/, function($0) {
                return +$0 + 1
            }));
        }
    },
    URLNumDown: {
        name: "URL中的数字递减",
        cmd: function() {
            loadURI(content.location.href.replace(/(\d+)(?=\D*$)/, function($0) {
                return +$0 - 1 > 0 ? +$0 - 1 : 0;
            }));
        }
    },
    aboutConfig: {
        name: "打开about:config",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab("about:config");
        }
    },
    openChromeDir: {
        name: "打开Chrome目录",
        cmd: function() {
            Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).reveal();
        }
    },
    openProfileDir: {
        name: "打开Profile目录",
        cmd: function() {
            Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).reveal();
        }
    },
    openExplorer: {
        name: "打开我的电脑",
        cmd: function() {
            try {
                var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("WinD", Components.interfaces.nsILocalFile);
                file.append("explorer.exe");
                var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
                process.init(file);
                process.run(false, [","], 1);

            } catch (ex) {
                alert("打开我的电脑失败!")
            }
        }
    },
    openSndVol: {
        name: "打开音量控制器",
        cmd: function() {
            try {
                var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("SysD", Components.interfaces.nsILocalFile);
                file.append(/6/.test(navigator.oscpu) ? "sndvol.exe" : "sndvol32.exe");
                var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
                process.init(file);
                process.run(false, ["-f"], 1);
            } catch (ex) {
                alert("打开音量控制器失败!")
            }
        }
    },
    openTaskMgr: {
        name: "打开任务管理器",
        cmd: function() {
            try {
                var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                file.initWithPath(Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("SysD", Components.interfaces.nsILocalFile).path + "\\taskmgr.exe");
                file.launch();
            } catch (ex) {
                alert("打开任务管理器失败!")
            }
        }
    },
    openIE: {
        name: "用IE打开当前页",
        cmd: function() {
            try {
                var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProgF", Components.interfaces.nsILocalFile);
                file.append("Internet Explorer");
                file.append("iexplore.exe");
                var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
                process.init(file);
                process.run(false, [content.location.href], 1);
            } catch (ex) {
                alert("打开IE失败!")
            }
        }
    },
    openPreferences: {
        name: "打开选项窗口",
        cmd: function() {
            openPreferences();
        }
    },
    BrowserOpenAddonsMgrTab: {
        name: "打开附加组件窗口",
        cmd: function() {
            BrowserOpenAddonsMgr();
        }
    },
    BrowserOpenAddonsMgrWindow: {
        name: "打开附加组件窗口(新窗口)",
        cmd: function() {
            window.open("about:addons", "history-pane", "chrome,resizable=yes,centerscreen").resizeTo(800, 600);
        }
    },
    BrowserDownloadsUI: {
        name: "打开下载窗口",
        cmd: function() {
            BrowserDownloadsUI();
        }
    },
    showHistory: {
        name: "打开我的足迹窗口",
        cmd: function() {
            PlacesCommandHook.showPlacesOrganizer('History');
        }
    },
    JavaScriptConsole: {
        name: "打开错误控制台窗口",
        cmd: function() {
            toJavaScriptConsole();
        }
    },
    BrowserCustomizeToolbar: {
        name: "打开定制工具栏窗口",
        cmd: function() {
            BrowserCustomizeToolbar();
        }
    },
    viewHistorySidebar: {
        name: "打开历史窗口(侧边栏)",
        cmd: function() {
            toggleSidebar('viewHistorySidebar');
        }
    },
    viewHistoryNewWindow: {
        name: "打开历史窗口(新窗口)",
        cmd: function() {
            window.open("chrome://browser/content/history/history-panel.xul", "history-pane", "chrome,resizable=yes,centerscreen").resizeTo(400, 600);
        }
    },
    gFindBarToggle: {
        name: "打开或关闭查找栏",
        cmd: function() {
            gFindBar.open() || gFindBar.close();
        }
    },
    openFileMenu: {
        name: "打开文件菜单",
        cmd: function(self, event) {
            document.getElementById("file-menu").menupopup.openPopup(null, null, event.screenX, event.screenY);
        }
    },
    openViewMenu: {
        name: "打开工具菜单",
        cmd: function(self, event) {
            document.getElementById("tools-menu").menupopup.openPopup(null, null, event.screenX, event.screenY);
        }
    },
    openToolsMenu: {
        name: "打开查看菜单",
        cmd: function(self, event) {
            document.getElementById("view-menu").menupopup.openPopup(null, null, event.screenX, event.screenY);
        }
    },
    oepnClipboard: {
        name: "打开剪切板中的网址",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab(readFromClipboard());
        }
    },
    openWebPanel: {
        name: "侧边栏打开当前页面",
        cmd: function() {
            openWebPanel(content.document.title, content.location);
        }
    },
    copyURLToClipboard: {
        name: "复制当前页面URL",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(content.location);
        }
    },
    copyURLTitleToClipboard: {
        name: "复制当前页面URL+标题",
        cmd: function() {
            Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(content.document.title + " - " + content.location);
        }
    },
    openHomeDialog: {
        name: "将当前页面设为主页",
        cmd: function() {
            openHomeDialog(content.location);
        }
    },
    bookmarkCurrentPages: {
        name: "添加所有标签到书签",
        cmd: function() {
            PlacesCommandHook.bookmarkCurrentPages();
        }
    },
    BrowserViewSourceOfDocument: {
        name: "查看源代码",
        cmd: function() {
            BrowserViewSourceOfDocument(content.document);
        }
    },
    cmd_fullZoomEnlarge: {
        name: "页面放大",
        cmd: function() {
            FullZoom.enlarge();
        }
    },
    cmd_fullZoomReduce: {
        name: "页面缩小",
        cmd: function() {
            FullZoom.reduce();
        }
    },
    cmd_fullZoomReset: {
        name: "页面重置",
        cmd: function() {
            FullZoom.reset();
        }
    },
    gifPlay: {
        name: "切换GIF动画循环",
        cmd: function() {
            Array.forEach(content.document.querySelectorAll("img"), function(gif) {
                try {
                    gif.QueryInterface(Ci.nsIImageLoadingContent).getRequest(Ci.nsIImageLoadingContent.CURRENT_REQUEST).image.animationMode ^= 1;
                } catch (e) {}
            })
        }
    },
    imgShow: {
        name: "切换图片显示",
        cmd: function() {
            !/img, embed, object { visibility: hidden/.test(content.document.getElementsByTagName("head")[0].lastElementChild.innerHTML) ? content.document.getElementsByTagName("head")[0].appendChild(content.document.createElement("style")).innerHTML = "img, embed, object { visibility: hidden !important; }html * { background-image: none !important; }" : content.document.getElementsByTagName("head")[0].removeChild(content.document.getElementsByTagName("head")[0].lastElementChild);
        }
    },
    StyleDisabled: {
        name: "切换css样式",
        cmd: function() {
            getMarkupDocumentViewer().authorStyleDisabled ^= 1;
        }
    },
    proxyTypeA: {
        name: "切换代理(无代理<->系统代理)",
        cmd: function() {
            var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            pref.setIntPref("network.proxy.type", pref.getIntPref("network.proxy.type") == 0 ? 5 : 0);
        }
    },
    proxyTypeB: {
        name: "切换代理(无代理<->手动配置代理)",
        cmd: function() {
            var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            pref.setIntPref("network.proxy.type", pref.getIntPref("network.proxy.type") == 0 ? 1 : 0);
        }
    },
    contentShow: {
        name: "切换当前网页显示",
        cmd: function() {
            Application.version[0] > 3 ? getMarkupDocumentViewer().setPageMode(content.show = (typeof content.show == "undefined" || content.show == 0), {}) : ((content.show = (typeof content.show == "undefined" || content.show == 0)) ? getMarkupDocumentViewer().hide() : getMarkupDocumentViewer().show());
        }
    },
    contentEditable: {
        name: "切换当前网页可编辑",
        cmd: function() {
            content.document.body.contentEditable = content.document.body.contentEditable == "true" ? "false" : "true";
        }
    },
    menubarShow: {
        name: "切换菜单栏显示",
        cmd: function() {
            document.getElementById("toolbar-menubar").setAttribute("autohide", document.getElementById("toolbar-menubar").getAttribute("autohide") == "true" ? "false" : "true");
        }
    },
    toggleTabView: {
        name: "显示标签页组管理器",
        cmd: function() {
            TabView.toggle();
        }
    },
    toggleTabViewNormal: {
        name: "无动画显示标签页组管理器",
        cmd: function() {
            TabView._deck ? TabView._deck.selectedIndex ^= 1 : TabView.toggle();
        }
    },
    showAllTabViewTab: {
        name: "临时显示所有标签页组标签",
        cmd: function() {
            Array.forEach(gBrowser.mTabs, function(tab) {
                tab.removeAttribute("hidden");
            })
        }
    },
    nextTabView: {
        name: "切换标签页组",
        cmd: function() {
            gBrowser.selectedTab = Array.filter(gBrowser.mTabs, function(tab) {
                return tab._tPos > gBrowser.mCurrentTab._tPos && tab.getAttribute("hidden") == "true";
            })[0] || Array.filter(gBrowser.mTabs, function(tab) {
                return tab.getAttribute("hidden") == "true";
            })[0];
        }
    },
    addCurrentTabToTabView: {
        name: "将当前tab放入新标签页组",
        cmd: function() {
            TabView.moveTabTo(gBrowser.mCurrentTab);
        }
    },
    openAllTabs: {
        name: "显示所有标签页缩略图",
        cmd: function() {
            allTabs.open();
        }
    },
    captureVisible: {
        name: "页面可见区域截图",
        cmd: function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = content.innerWidth;
            canvas.height = content.innerHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(content, content.pageXOffset, content.pageYOffset, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png");
        }
    },
    captureAll: {
        name: "页面所有区域截图",
        cmd: function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = content.document.documentElement.scrollWidth;
            canvas.height = content.document.documentElement.scrollHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(content, 0, 0, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png");
        }
    },
    captureFirefox: {
        name: "浏览器界面截图",
        cmd: function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(window, 0, 0, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), "Firefox.png");
        }
    },
    copyExtensionsList: {
        name: "复制扩展清单",
        cmd: function() {
            Application.extensions ? Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(Application.extensions.all.map(function(item, id) {
                return id + 1 + ": " + item._item.name;
            }).join("\n")) : Application.getExtensions(function(extensions) {
                Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(extensions.all.map(function(item, id) {
                    return id + 1 + ": " + item._item.name;
                }).join("\n"));
            })
        }
    },
    togglegPrivateBrowsingUI: {
        name: "新建隐私浏览窗口",
        cmd: function() {
            OpenBrowserWindow({private: true});
        }
    },
    saveDocument: {
        name: "保存当前页面",
        cmd: function() {
            saveDocument(window.content.document);
        }
    },
    minimize: {
        name: "最小化窗口",
        cmd: function(self) {
            self.isMouseDownR = false;
            setTimeout("minimize()", 10);
        }
    },
    maximize: {
        name: "最大化窗口",
        cmd: function() {
            maximize();
        }
    },
    FullScreen: {
        name: "全屏窗口",
        cmd: function() {
            BrowserFullScreen();
        }
    },
    restore: {
        name: "还原窗口",
        cmd: function() {
            restore();
        }
    },
    stayLeft: {
        name: "窗口占用屏幕左半部分",
        cmd: function() {
            resizeTo(screen.availWidth / 2, screen.availHeight, moveTo(0, 0));
        }
    },
    stayRight: {
        name: "窗口占用屏幕右半部分",
        cmd: function() {
            resizeTo(screen.availWidth / 2, screen.availHeight, moveTo(screen.availWidth / 2, 0));
        }
    },
    restart: {
        name: "重启浏览器",
        cmd: function() {
            Application.restart();
        }
    },
    removeCacheRestart: {
        name: "删除启动缓存并重启",
        cmd: function() {
            Services.appinfo.invalidateCachesOnRestart() || Application.restart();
        }
    },
    goQuitApplication: {
        name: "关闭浏览器",
        cmd: function() {
            goQuitApplication();
        }
    },
}
$(function() {
    $("#doNotGenerate").parent().after('<br/><b id="MouseGesturesScriptLineNum" style="float:right">行数:0</b><br/><textarea spellcheck="false" style="resize:none;background-color:#000000;color: #FFFFFF;width:100%;height:600px" id="MouseGesturesScript"></textarea>');
    $("#doNotGenerate").attr("checked", false);
    $("#MouseGesturesScript").bind("keyup", function(e) {
        e.keyCode == 13 && e.ctrlKey && $("#runScript").click();
    });
    var dir = ["U", "D", "L", "R"];
    for (var i in dir) {
        for (var j in dir) {
            if (j != i) {
                for (var p in dir) {
                    if (j != p) {
                        var title = dir[i] + dir[j] + dir[p];
                        var value = title.replace(/U/g, "上").replace(/D/g, "下").replace(/L/g, "左").replace(/R/g, "右");
                        $("#gesturesChain").append('<option value="' + title + '" title="' + title + '">' + value + '</option>');
                    }
                }
            }
        }
    }
    for (var i in dir) {
        for (var j in dir) {
            if (j != i) {
                for (var p in dir) {
                    if (j != p) {
                        for (var q in dir) {
                            if (q != p) {
                                var title = dir[i] + dir[j] + dir[p] + dir[q];
                                var value = title.replace(/U/g, "上").replace(/D/g, "下").replace(/L/g, "左").replace(/R/g, "右");
                                $("#gesturesChain").append('<option value="' + title + '" title="' + title + '">' + value + '</option>');
                            }
                        }
                    }
                }
            }
        }
    }
    [i
        for (i in MouseGestures)
            if (MouseGestures[i].toString() == "[object Object]")
    ].map(
        function(key) {
            $("#gesturesCommand").append('<option value="' + key + '">' + MouseGestures[key].name + '</option>')
        })
    $("#gesturesCommand").parent().after('<label style="color:white">' + $("#gesturesCommand>*").length + '</label>');
})