/*
* Aloha Font Family Selector Plugin - select font family from 8 Definitive Web Font Stacks
* 
*   Copyright (C) 2011 by Recess Mobile and Anatoliy Chakkaev
*
* Licensed unter the terms of AGPL http://www.gnu.org/licenses/agpl-3.0.html
*
*/

GENTICS.Aloha.FontFamilySelector = new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.FontFamilySelector");

GENTICS.Aloha.FontFamilySelector.languages = ['en', 'ru'];

var fontFamilies = [
  // The Times New Roman-based serif
  [ 'The Times New Roman-based serif', 'Cambria, "Hoefler Text", Utopia, "Liberation Serif", "Nimbus Roman No9 L Regular", Times, "Times New Roman", serif'],
  // A modern Georgia-based serif
  [ 'A modern Georgia-based serif', 'Constantia, "Lucida Bright", Lucidabright, "Lucida Serif", Lucida, "DejaVu Serif," "Bitstream Vera Serif", "Liberation Serif", Georgia, serif'],
  // The traditional Garamond-based serif stack
  [ 'The traditional Garamond-based serif', '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", "Book Antiqua", Baskerville, "Bookman Old Style", "Bitstream Charter", "Nimbus Roman No9 L", Garamond, "Apple Garamond", "ITC Garamond Narrow", "New Century Schoolbook", "Century Schoolbook", "Century Schoolbook L", Georgia, serif'],
  // The Helvetica/Arial-based sans serif stack
  [ 'The Helvetica/Arial-based sans serif', 'Frutiger, "Frutiger Linotype", Univers, Calibri, "Gill Sans", "Gill Sans MT", "Myriad Pro", Myriad, "DejaVu Sans Condensed", "Liberation Sans", "Nimbus Sans L", Tahoma, Geneva, "Helvetica Neue", Helvetica, Arial, sans-serif'],
  // The Verdana-based sans serif stack
  [ 'The Verdana-based sans serif', 'Corbel, "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", "DejaVu Sans", "Bitstream Vera Sans", "Liberation Sans", Verdana, "Verdana Ref", sans-serif'],
  // The Trebuchet-based sans serif stack
  [ 'The Trebuchet-based sans serif', '"Segoe UI", Candara, "Bitstream Vera Sans", "DejaVu Sans", "Bitstream Vera Sans", "Trebuchet MS", Verdana, "Verdana Ref", sans-serif'],
  // The heavier "Impact" sans serif stack
  [ 'The heavier "Impact" sans serif', 'Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans-serif'],
  // The monospace stack
  [ 'The monospace', 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace']
];

/*
 * Initalize plugin
 */
GENTICS.Aloha.FontFamilySelector.init = function () {
  var that = this;
  var scope = 'GENTICS.Aloha.continuoustext';
  that.multiSplitItems = [];
  jQuery.each(fontFamilies, function (j, font) {
    var button = font[0].replace(/[^a-z]/gi, '').toLowerCase();
    var family = font[1];

    var markupClassName = 'GENTICS_markup_font_' + family.split(',')[0].replace(/[^a-z]/i, '');
    var markup = jQuery('<span class="' + markupClassName + '" style=\'font-family:' + family + '\'></span>');

    that.multiSplitItems.push({
      'name' : markupClassName,
      'tooltip' : family.replace(/"/g, ''),
      'iconClass' : 'GENTICS_button ' + that.i18n('GENTICS_button_' + button),
      'markup' : markup,
      'click' : function() {
        setFont(family);
      }
    });
  });
  if (this.multiSplitItems.length > 0) {
    this.multiSplitButton = new GENTICS.Aloha.ui.MultiSplitButton({
      'items' : this.multiSplitItems
    });
    GENTICS.Aloha.FloatingMenu.addButton(
      scope,
      this.multiSplitButton,
      this.i18n('floatingmenu.tab.format'),
      3
    );
    setTimeout(function () {
      var w = that.multiSplitButton.extButton.wrapper;
      w.width(170);
      w.find('ul.GENTICS_multisplit').width(155);
      w.find('button.GENTICS_button').css('width', '149px !important');
    }, 2000);
  }

  GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
    // store editor
    GENTICS.Aloha.FontFamilySelector.editable = GENTICS.Aloha.activeEditable;

    // find markup
    var rangeObject = GENTICS.Aloha.Selection.rangeObject;
    var foundMarkup = rangeObject.findMarkup(function() {
      return this && this.nodeName.toLowerCase() == 'span' && this.className.match(/^GENTICS_markup_font_/);
    }, GENTICS.Aloha.FontFamilySelector.editable.obj);

    if (foundMarkup) {
      that.multiSplitButton.setActiveItem(foundMarkup.className);
    } else {
      that.multiSplitButton.setActiveItem('');
    }
  });

};

Ext.ux.AlohaAttributeSelect = Ext.extend(Ext.form.ComboBox, {
  mode: 'local',
  displayField: 'family',
  emptyText:'Select a font...',
  triggerAction: 'all',
  store: new Ext.data.SimpleStore({
    fields: ['name', 'family'],
    data: fontFamilies
  }),
  tpl: '<tpl for="."><div ext:qtip=\'{family}\' class="x-combo-list-item" style=\'font-family: {family}; font-size: 1.2em\'>{name}</div></tpl>',
  onSelect: function (select) {
    this.list.hide();
    setFont(select.data.family);
    return false;
  }
});


function setFont (family) {
  var markupClassName = 'GENTICS_markup_font_' + family.split(',')[0].replace(/[^a-z]/i, '');

  var markup = jQuery('<span class="' + markupClassName + '" style=\'font-family:' + family + '\'></span>');
  var rangeObject = GENTICS.Aloha.Selection.rangeObject;

  // GENTICS.Aloha.FontFamilySelector.editable.obj[0].focus();

  // check whether the markup is found in the range (at the start of the range)
  var foundMarkup = rangeObject.findMarkup(function() {
    return this.nodeName.toLowerCase() == 'span' && this.className === markupClassName;
  }, GENTICS.Aloha.FontFamilySelector.editable.obj);

  if (foundMarkup) {
    // remove the markup
    if (rangeObject.isCollapsed()) {
      // when the range is collapsed, we remove exactly the one DOM element
      GENTICS.Utils.Dom.removeFromDOM(foundMarkup, rangeObject, true);
    } else {
      // the range is not collapsed, so we remove the markup from the range
      GENTICS.Utils.Dom.removeMarkup(rangeObject, markup, GENTICS.Aloha.FontFamilySelector.editable.obj);
    }
  }

  // when the range is collapsed, extend it to a word
  if (rangeObject.isCollapsed()) {
    GENTICS.Utils.Dom.extendToWord(rangeObject);
  }

  // add the markup
  GENTICS.Utils.Dom.addMarkup(rangeObject, markup);

  // select the modified range
  // rangeObject.select();
}

/**
 * Register the Aloha font selector field
 * @hide
 */
Ext.reg('alohaattributeselect', Ext.ux.AlohaAttributeSelect);

/**
 * Aloha Attribute Field Button
 * @namespace GENTICS.Aloha.ui
 * @class AttributeSelect
 */
GENTICS.Aloha.ui.AttributeSelect = function (properties) {

  /**
   * @cfg Function called when an element is selected
   */
  this.onSelect = null;
  this.listenerQueue = [];
  this.objectTypeFilter = null;
  this.tpl = null;
  this.displayField = null;

  this.init(properties);
};

/**
 * Inherit all methods and properties from GENTICS.Aloha.ui.Button
 * @hide
 */
GENTICS.Aloha.ui.AttributeSelect.prototype = new GENTICS.Aloha.ui.Button({
});

/**
 * Create a extjs alohaattributefield
 * @hide
 */
GENTICS.Aloha.ui.AttributeSelect.prototype.getExtConfigProperties = function() {
  return {
    alohaButton: this,
    xtype : 'alohaattributeselect',
    rowspan: this.rowspan||undefined,
    width: this.width||undefined,
    id : this.id
  };
};

