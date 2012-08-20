var koch = (function(){
	function kochFrag(len, depth){
		if (depth > 1) {
			kochFrag(len/3, depth-1);
			t.rt(60);
			kochFrag(len/3, depth-1);
			t.lt(120);
			kochFrag(len/3, depth-1);
			t.rt(60);
			kochFrag(len/3, depth-1);
		} else {
			t.fd(len);
		}
	}
	return function(len, depth){
		kochFrag(len,depth);
		t.lt(120);
		kochFrag(len,depth);
		t.lt(120);
		kochFrag(len,depth);
		t.lt(120);
	}
})();
