(function(global) {
	'use strict';

	function fixLength(num) {
		return ('00000000' + num.toString(16)).slice(-8);
	}

	function composeGDT(gdt) {
		var byte7 = (gdt.base >> 24) & 0xFF;
		var limit = gdt.limit;
		var g = false;
		if (limit > 1 << 20) {
			var g = true;
			limit >>>= 12;
		}
		var byte6 = (g ? 0x80 : 0) | (gdt.bits === 32 ? 0x40 : 0) | (gdt.bits === 64 ? 0x20 : 0) | ((limit >> 16) & 0xF);
		var byte5 = (gdt.present ? 0x80 : 0) | ((gdt.dpl & 3) << 5) | (gdt.system ? 0 : 0x10) | (gdt.code ? 8 : 0) | (gdt.conforming ? 4 : 0) | (gdt.write ? 2 : 0) | (gdt.accessed ? 1 : 0);
		var byte4 = (gdt.base >> 16) & 0xFF;
		var hiDword = byte7 << 24 | byte6 << 16 | byte5 << 8 | byte4;
		var loDword = (gdt.base & 0xFFFF) << 16 | limit & 0xFFFF;
		return fixLength(hiDword) + fixLength(loDword);
	}

	function decomposeGDT(gdt) {
		if (gdt.length !== 16) gdt = ('0000000000000000' + gdt).slice(-16);
		var hiDword = parseInt(gdt.substring(0, 8), 16);
		var loDword = parseInt(gdt.substring(8), 16);
		var byte7 = (hiDword >> 24) & 0xFF;
		var byte6 = (hiDword >> 16) & 0xFF;
		var byte5 = (hiDword >> 8) & 0xFF;
		var byte4 = hiDword & 0xFF;
		var base = byte7 << 24 | byte4 << 16 | (loDword >> 16) & 0xFFFF;
		var limit = (byte6 & 0xF) << 16 | loDword & 0xFFFF;
		if (byte6 & 0x80) limit = limit << 12 | 0xFFF;
		var bits = byte6 & 0x40 ? 32 : (byte6 & 0x20 ? 64 : 16);
		var present = !!(byte5 & 0x80);
		var dpl = (byte5 >> 5) & 3;
		var system = !(byte5 & 0x10);
		var code = !!(byte5 & 8);
		var conforming = !!(byte5 & 4);
		var write = !!(byte5 & 2);
		var accessed = !!(byte5 & 1);
		return {
			base: base,
			limit: limit < 0 ? limit + 0x100000000 : limit,
			bits: bits,
			present: present,
			dpl: dpl,
			system: system,
			code: code,
			conforming: conforming,
			write: write,
			accessed: accessed
		};
	}
	global.GDT = {
		compose: composeGDT,
		decompose: decomposeGDT
	}
})(this);