describe('aria-allowed-attr', function() {
	'use strict';

	var fixture = document.getElementById('fixture');
	var flatTreeSetup = axe.testUtils.flatTreeSetup;
	var checkContext = axe.testUtils.MockCheckContext();

	afterEach(function() {
		fixture.innerHTML = '';
		checkContext.reset();
		axe.reset();
	});

	it('should detect incorrectly used attributes', function() {
		var node = document.createElement('div');
		node.setAttribute('role', 'link');
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('aria-selected', 'true');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isFalse(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
		assert.deepEqual(checkContext._data, ['aria-selected="true"']);
	});

	it('should not report on required attributes', function() {
		var node = document.createElement('div');
		node.setAttribute('role', 'checkbox');
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('aria-checked', 'true');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isTrue(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
	});

	it('should detect incorrectly used attributes - implicit role', function() {
		var node = document.createElement('a');
		node.href = '#';
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('aria-selected', 'true');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isFalse(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
		assert.deepEqual(checkContext._data, ['aria-selected="true"']);
	});

	it('should return true if there is no role', function() {
		var node = document.createElement('div');
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('aria-selected', 'true');
		node.setAttribute('aria-checked', 'true');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isTrue(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
		assert.isNull(checkContext._data);
	});

	it('should not report on invalid attributes', function() {
		var node = document.createElement('div');
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('aria-cats', 'true');
		node.setAttribute('role', 'dialog');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isTrue(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
		assert.isNull(checkContext._data);
	});

	it('should not report on allowed attributes', function() {
		var node = document.createElement('div');
		node.id = 'test';
		node.tabIndex = 1;
		node.setAttribute('role', 'radio');
		node.setAttribute('aria-required', 'true');
		node.setAttribute('aria-checked', 'true');
		fixture.appendChild(node);
		flatTreeSetup(fixture);

		assert.isTrue(
			axe.testUtils
				.getCheckEvaluate('aria-allowed-attr')
				.call(checkContext, node)
		);
		assert.isNull(checkContext._data);
	});

	describe('options', function() {
		it('should allow provided attribute names for a role', function() {
			axe.configure({
				standards: {
					ariaRoles: {
						mccheddarton: {
							allowedAttrs: ['aria-checked']
						}
					}
				}
			});

			fixture.innerHTML =
				'<div role="mccheddarton" id="target" aria-checked="true" aria-selected="true"></div>';
			var target = fixture.children[0];
			flatTreeSetup(fixture);

			assert.isFalse(
				axe.testUtils
					.getCheckEvaluate('aria-allowed-attr')
					.call(checkContext, target)
			);

			assert.isTrue(
				axe.testUtils
					.getCheckEvaluate('aria-allowed-attr')
					.call(checkContext, target, {
						mccheddarton: ['aria-checked', 'aria-selected']
					})
			);
		});

		it('should handle multiple roles provided in options', function() {
			axe.configure({
				standards: {
					ariaRoles: {
						mcheddarton: {
							allowedAttrs: ['aria-checked']
						},
						bagley: {
							allowedAttrs: ['aria-checked']
						}
					}
				}
			});

			fixture.innerHTML =
				'<div role="bagley" id="target" aria-selected="true"></div>';
			var target = fixture.children[0];
			var options = {
				mccheddarton: ['aria-selected'],
				bagley: ['aria-selected']
			};
			flatTreeSetup(fixture);

			assert.isFalse(
				axe.testUtils
					.getCheckEvaluate('aria-allowed-attr')
					.call(checkContext, target)
			);

			assert.isTrue(
				axe.testUtils
					.getCheckEvaluate('aria-allowed-attr')
					.call(checkContext, target, options)
			);
		});
	});
});
