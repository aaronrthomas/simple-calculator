(function(){
	const displayEl = document.getElementById('display');
	const buttons = document.querySelectorAll('.btn');
	let expr = ''; // current expression shown/edited

	function updateDisplay(){
		displayEl.textContent = expr === '' ? '0' : expr;
	}

	function appendValue(val){
		// replace ×/÷ with * and /
		expr += val;
		updateDisplay();
	}

	function safeEvaluate(s){
		// allow digits, operators, parentheses and dot only
		if (!/^[0-9+\-*/().\s]+$/.test(s)) return 'Error';
		try{
			// prevent trailing operators
			s = s.replace(/÷/g,'/').replace(/×/g,'*').trim();
			if (/[+\-*/.]$/.test(s)) s = s.slice(0, -1);
			// eslint-disable-next-line no-new-func
			let result = Function('"use strict"; return (' + s + ')')();
			if (result === Infinity || result === -Infinity || Number.isNaN(result)) return 'Error';
			// trim long floats
			if (!Number.isInteger(result)) result = parseFloat(result.toFixed(10));
			return String(result);
		}catch(e){
			return 'Error';
		}
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const v = btn.dataset.value;
			const action = btn.dataset.action;
			if (action === 'clear'){
				expr = '';
				updateDisplay();
				return;
			}
			if (action === 'del'){
				expr = expr.slice(0, -1);
				updateDisplay();
				return;
			}
			if (action === 'equals'){
				const out = safeEvaluate(expr);
				expr = (out === 'Error') ? '' : out;
				displayEl.textContent = out;
				return;
			}
			// value buttons
			if (v){
				// normalize ×/÷ if user clicked those (we store * and / internally)
				let char = v;
				if (char === '×') char = '*';
				if (char === '÷') char = '/';
				// prevent multiple dots in a single number
				if (char === '.'){
					// find last number segment
					const last = expr.match(/([0-9.]+)$/);
					if (last && last[0].includes('.')) return;
					if (!last) char = '0.';
				}
				// prevent consecutive operators (except minus for negative)
				if (/[+\-*/]/.test(char)){
					if (expr === '' && char !== '-') return;
					if (/[+\-*/]$/.test(expr) && char !== '-') {
						// replace last operator
						expr = expr.slice(0, -1) + char;
						updateDisplay();
						return;
					}
				}
				appendValue(char);
			}
		});
	});

	// Keyboard support
	window.addEventListener('keydown', (e) => {
		const key = e.key;
		if ((/^[0-9]$/).test(key)) appendValue(key);
		else if (key === '.' ) appendValue('.');
		else if (key === 'Enter' || key === '=') {
			e.preventDefault();
			const out = safeEvaluate(expr);
			expr = (out === 'Error') ? '' : out;
			displayEl.textContent = out;
		}
		else if (key === 'Backspace') {
			expr = expr.slice(0, -1);
			updateDisplay();
		}
		else if (key === 'Escape') {
			expr = '';
			updateDisplay();
		}
		else if (/[+\-*/()]/.test(key)) appendValue(key);
	});

	updateDisplay();
})();