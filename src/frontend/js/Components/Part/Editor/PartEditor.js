/**
 * @class PartKeepr.PartEditor

 * <p>The PartEditor provides an editing form for a part. It contains multiple tabs, one for each nested record.</p>
 */
Ext.define('PartKeepr.PartEditor', {
	extend: 'PartKeepr.Editor',
	
	// Assigned model
	model: 'PartKeepr.Part',
	
	// Layout stuff
	border: false,
	layout: 'fit',
	bodyStyle: 'background:#DBDBDB;',
	
	/**
	 * Initializes the editor fields
	 */
	initComponent: function () {
		
		this.nameField = Ext.create("Ext.form.field.Text", {
			name: 'name',
			fieldLabel: i18n("Name"),
			allowBlank: false,
			labelWidth: 150
		});
		
		// Defines the basic editor fields
		var basicEditorFields = [
			this.nameField,
			{
				layout: 'column',
				bodyStyle: 'background:#DBDBDB',
				border: false,
				items: [{
						xtype: 'numberfield',
						fieldLabel: i18n('Minimum Stock'),
						allowDecimals: false,
						allowBlank: false,
						labelWidth: 150,
						name: 'minStockLevel',
						value: 0,
						columnWidth: 0.5,
						minValue: 0
					},{
						xtype: 'PartUnitComboBox',
						fieldLabel: i18n("Part Unit"),
						columnWidth: 0.5,
						margin: "0 0 0 5",
						name: 'partUnit',
						value: PartKeepr.getApplication().getDefaultPartUnit().get("id")
					}]
			},{
				xtype: 'CategoryComboBox',
				fieldLabel: i18n("Category"),
				name: 'category'
			},{
				xtype: 'StorageLocationComboBox',
				fieldLabel: i18n("Storage Location"),
				name: 'storageLocation',
				allowBlank: false
			},{
				xtype: 'FootprintComboBox',
				fieldLabel: i18n("Footprint"),
				name: 'footprint'
			},{
				xtype: 'textarea',
				fieldLabel: i18n("Comment"),
				name: 'comment'
			},{
				xtype: 'textfield',
				fieldLabel: i18n("Status"),
				name: 'status'
			},{
				xtype: 'checkbox',
				hideEmptyLabel: false,
				fieldLabel: '',
				boxLabel: i18n("Needs Review"),
				name: 'needsReview'
			}];
		
		// Creates the distributor grid
		this.partDistributorGrid = Ext.create("PartKeepr.PartDistributorGrid", {
			title: i18n("Distributors"),
			layout: 'fit'
		});
		
		// Creates the manufacturer grid
		this.partManufacturerGrid = Ext.create("PartKeepr.PartManufacturerGrid", {
			title: i18n("Manufacturers"),
			layout: 'fit'
		});
		
		// Creates the parameter grid
		this.partParameterGrid = Ext.create("PartKeepr.PartParameterGrid", {
			title: i18n("Parameters"),
			layout: 'fit'
		});
		
		// Creates the attachment grid
		this.partAttachmentGrid = Ext.create("PartKeepr.PartAttachmentGrid", {
			title: i18n("Attachments"),
			layout: 'fit'
		});
		
		// Adds stock level fields for new items
		if (this.partMode && this.partMode == "create") {
			this.initialStockLevel = Ext.create("Ext.form.field.Number", {
				fieldLabel: i18n("Initial Stock Level"),
				name: "initialStockLevel",
				labelWidth: 150,
				columnWidth: 0.5
			});
			
			this.initialStockLevelUser = Ext.create("PartKeepr.UserComboBox", {
				fieldLabel: i18n("Stock User"),
				name: 'initialStockLevelUser',
				columnWidth: 0.5,
				margin: "0 0 0 5"
			});
			
			basicEditorFields.push({
				layout: 'column',
				bodyStyle: 'background:#DBDBDB',
				border: false,
				items: [
				        this.initialStockLevel,
				        this.initialStockLevelUser
				]
			});
			
			this.initialStockLevelPrice = Ext.create("Ext.form.field.Number", {
				fieldLabel: i18n('Price'),
				labelWidth: 150,
				columnWidth: 0.5,
				name: 'initialStockLevelPrice'
			});
			
			this.initialStockLevelPricePerItem = Ext.create("Ext.form.field.Checkbox", {
				boxLabel: i18n("Per Item"),
				columnWidth: 0.5,
				margin: "0 0 0 5",
				name: 'initialStockLevelPricePerItem'
			});
			
			basicEditorFields.push({
				layout: 'column',
				bodyStyle: 'background:#DBDBDB',
				border: false,
				items: [
				        this.initialStockLevelPrice,
				        this.initialStockLevelPricePerItem
				]
			});
			
			
		}
		
		// Create a tab panel of all fields
		this.items = {
				xtype: 'tabpanel',
				border: false,
				plain: true,
				items: [{
					xtype: 'panel',
					border: false,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
				        anchor: '100%',
				        labelWidth: 150
				    },
					bodyStyle: 'background:#DBDBDB;padding: 10px;',
					title: i18n("Basic Data"),
					items: basicEditorFields
				},
				this.partDistributorGrid,
				this.partManufacturerGrid,
				this.partParameterGrid,
				this.partAttachmentGrid
				]
		};
		
		this.on("startEdit", this.onEditStart, this, { delay: 200 });
		this.on("itemSaved", this._onItemSaved, this);
		
		this.addEvents("partSaved", "titleChange");
		
		this.callParent();
		
	},
	onEditStart: function () {
		this.bindChildStores();
		this.nameField.focus();
	},
	_onItemSaved: function () {
		this.fireEvent("partSaved", this.record);
		
		if (this.keepOpenCheckbox.getValue() !== true) {
			this.fireEvent("editorClose", this);
		} else {
			var newItem = Ext.create("PartKeepr.Part", this.partDefaults);
			this.editItem(newItem);
		}
	},
	bindChildStores: function () {
		this.partDistributorGrid.bindStore(this.record.distributors());
		this.partManufacturerGrid.bindStore(this.record.manufacturers());
		this.partParameterGrid.bindStore(this.record.parameters());
		this.partAttachmentGrid.bindStore(this.record.attachments());
	},
	onItemSave: function () {
		if (!this.getForm().isValid()) {
			return;
		}
		
		this.callParent();
	},
	_setTitle: function (title) {
		var tmpTitle;
		
		if (this.record.phantom) {
			tmpTitle = i18n("Add Part");
		} else {
			tmpTitle = i18n("Edit Part");	
		}
		
		if (title !== "") {
			 tmpTitle = tmpTitle + ": " + title;
		}
		
		this.fireEvent("titleChange", tmpTitle);
	}
});
