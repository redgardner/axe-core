describe('text.accessibleText', function () {
	'use strict';

	var fixture = document.getElementById('fixture');

	afterEach(function () {
		fixture.innerHTML = '';
	});

	describe('findLabel', function () {
		/*global findLabel */
		it('should find label specified with from', function () {
			fixture.innerHTML = '<input id="target"><label for="target" id="targetLabel">Text</label>';
			var target = fixture.querySelector('#target');
			var label = findLabel(target);
			assert.isNotNull(label);
			assert.equal(label.id, 'targetLabel');
		});

		it('should find label in DOM hierarchy', function () {
			fixture.innerHTML = '<label id="targetLabel">Text <input id="target"></label>';
			var target = fixture.querySelector('#target');
			var label = findLabel(target);
			assert.isNotNull(label);
			assert.equal(label.id, 'targetLabel');
		});

		it('should find label further up DOM hierarchy', function () {
			fixture.innerHTML = '<label id="targetLabel">Text <div><input id="target"></div></label>';
			var target = fixture.querySelector('#target');
			var label = findLabel(target);
			assert.isNotNull(label);
			assert.equal(label.id, 'targetLabel');
		});

		it('should find return null if there is no label', function () {
			fixture.innerHTML = '<input id="target">';
			var target = fixture.querySelector('#target');
			var label = findLabel(target);
			assert.isNull(label);
		});

	});

	describe('formValueText', function () {
		/*global formValueText */
		it('should return empty string for empty textareas', function () {
			fixture.innerHTML = '<textarea id="target"></textarea>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '');
		});

		it('should return value for textareas', function () {
			fixture.innerHTML = '<textarea id="target">3</textarea>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '3');
		});

		it('should return value for text inputs', function () {
			fixture.innerHTML = '<input type="text" id="target" value="3">';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '3');
		});

		it('should return empty string for hidden text inputs', function () {
			fixture.innerHTML = '<input type="hidden" id="target" value="3">';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '');
		});

		it('should return value for implicit text inputs', function () {
			fixture.innerHTML = '<input id="target" value="3">';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '3');
		});

		it('should return selected option values for multiple selects', function () {
			fixture.innerHTML = '<select id="target" multiple><option selected>1</option><option selected>3</option></select>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '1 3');
		});

		it('should return selected option value for selects', function () {
			fixture.innerHTML = '<select id="target"><option>1</option><option selected>3</option></select>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '3');
		});

		it('should return empty string for selects with no options', function () {
			fixture.innerHTML = '<select id="target"></select>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '');
		});
		it('should return empty string for selects with no selected option', function () {
			fixture.innerHTML = '<select id="target" multiple><option>1</option><option>3</option></select>';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '');
		});

		it('should return empty string for input if there is no value', function () {
			fixture.innerHTML = '<input id="target">';
			var target = fixture.querySelector('#target');
			assert.equal(formValueText(target), '');
		});
	});

	describe('accessibleText', function () {
		it('should match the first example from the ARIA spec', function () {
			fixture.innerHTML = '<ul role="menubar">' +
				' <!-- Rule 2A: "File" label via aria-labelledby -->' +
				'  <li role="menuitem" aria-haspopup="true" aria-labelledby="fileLabel" id="rule2a">' +
				'    <span id="fileLabel">File</span>' +
				'    <ul role="menu">' +
				'      <!-- Rule 2C: "New" label via Namefrom:contents -->' +
				'      <li role="menuitem" id="rule2c">New</li>' +
				'      <li role="menuitem">Open…</li>' +
				'      …' +
				'    </ul>' +
				'  </li>' +
				'</ul>';
			var rule2a = fixture.querySelector('#rule2a');
			var rule2c = fixture.querySelector('#rule2c');
			assert.equal(kslib.text.accessibleText(rule2a), 'File');
			assert.equal(kslib.text.accessibleText(rule2c), 'New');

		});

		it('should match the second example from the ARIA spec', function () {
			fixture.innerHTML = '<fieldset>' +
				'  <legend>Meeting alarms</legend>' +
				'  <!-- Rule 2A: "Beep" label given by native HTML label element -->' +
				'  <input type="checkbox" id="beep"> <label for="beep">Beep</label> <br>' +
				'  <input type="checkbox" id="mtgTitle"> <label for="mtgTitle">Display the meeting title</label> <br>' +
				'  <!-- Rule 2B -->' +
				'  <input type="checkbox" id="flash">' +
				'  <label for="flash">' +
				'    Flash the screen' +
				'    <!-- Rule 2A: label of text input given by aria-label, "Number of times to flash screen" -->' +
				'    <input type="text" value="3" size="2" id="numTimes" aria-label="Number of times to flash screen">' +
				'    times' +
				'  </label>' +
				'</fieldset>';

			var rule2a = fixture.querySelector('#beep');
			var rule2b = fixture.querySelector('#flash');
			assert.equal(kslib.text.accessibleText(rule2a), 'Beep');
			assert.equal(kslib.text.accessibleText(rule2b), 'Flash the screen 3 times');
		});


		it('should use aria-labelledby if present', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t1');
			assert.equal(kslib.text.accessibleText(target), 'This is a label');
		});

		it('should use recusive aria-labelledby properly', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1 t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t1');
			assert.equal(kslib.text.accessibleText(target), 'ARIA Label This is a label');
		});

		it('should use aria-label if present with no labelledby', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t1');
			assert.equal(kslib.text.accessibleText(target), 'ARIA Label');
		});

		it('should use alt on imgs with no ARIA', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'id="t1"> of <i>everything</i></div>' +
				'<img alt="Alt text goes here" id="target">' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#target');
			assert.equal(kslib.text.accessibleText(target), 'Alt text goes here');
		});

		it('should use alt on image inputs with no ARIA', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'id="t1"> of <i>everything</i></div>' +
				'<input type="image" alt="Alt text goes here" id="target">' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#target');
			assert.equal(kslib.text.accessibleText(target), 'Alt text goes here');
		});

		it('should use not use alt on text inputs with no ARIA', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'id="t1"> of <i>everything</i></div>' +
				'<input type="text" alt="Alt text goes here" id="target">' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#target');
			assert.equal(kslib.text.accessibleText(target), '');
		});

		it('should use HTML label if no ARIA information', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t1');
			assert.equal(kslib.text.accessibleText(target), 'HTML Label');
		});

		it('should handle last ditch title attribute', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i title="italics"></i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2label');
			assert.equal(kslib.text.accessibleText(target), 'This is This is a label of italics');
		});

		it('should handle totally empty elements', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i></i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2label');
			assert.equal(kslib.text.accessibleText(target), 'This is This is a label of');
		});


		it('should handle author name-from roles properly', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i role="alert">everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2label');
			assert.equal(kslib.text.accessibleText(target), 'This is This is a label of');
		});

		it('should only show each node once when label is before input', function () {
			fixture.innerHTML = '<div id="target"><label for="tb1">My form input</label>' +
				'<input type="text" id="tb1"></div>';
			var target = fixture.querySelector('#target');
			assert.equal(kslib.text.accessibleText(target), 'My form input');
		});

		it('should only show each node once when label follows input', function () {
			fixture.innerHTML = '<div id="target">' +
				'<input type="text" id="tb1"></div>' +
				'<label for="tb1">My form input</label>';
			var target = fixture.querySelector('#target');
			assert.equal(kslib.text.accessibleText(target), 'My form input');
		});

		it('should handle nested inputs in normal context', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2label');
			assert.equal(kslib.text.accessibleText(target), 'This is This is a label of everything');
		});

		it('should use handle nested inputs properly in labelledby context', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This is the value of everything');
		});

		it('should use ignore hidden inputs', function () {
			fixture.innerHTML = '<div id="t2label">This is <input type="hidden" value="the value" ' +
				'Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This is of everything');
		});

		it('should use handle inputs with no type as if they were text inputs', function () {
			fixture.innerHTML = '<div id="t2label">This is <input value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This is the value of everything');
		});

		it('should use handle nested selects properly in labelledby context', function () {
			fixture.innerHTML = '<div id="t2label">This is <select multiple ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1">' +
				'<option selected>first</option><option>second</option><option selected>third</option>' +
				'</select> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This is first third of everything');
		});

		it('should use handle nested textareas properly in labelledby context', function () {
			fixture.innerHTML = '<div id="t2label">This is <textarea ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1">the value</textarea> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This is the value of everything');
		});

		it('should use handle ARIA labels properly in labelledby context', function () {
			fixture.innerHTML = '<div id="t2label">This <span aria-label="not a span">span</span>' +
				' is <input type="text" value="the value" ' +
				'aria-labelledby="t1label" aria-label="ARIA Label" id="t1"> of <i>everything</i></div>' +
				'<div id="t1label">This is a <b>label</b></div>' +
				'<label for="t1">HTML Label</label>' +
				'<input type="text" id="t2" aria-labelledby="t2label">';

			var target = fixture.querySelector('#t2');
			assert.equal(kslib.text.accessibleText(target), 'This not a span is the value of everything');
		});

	});

});
