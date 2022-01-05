### What to do if case of new page

What things you need to change in case of a new page

* Remove from app.module and add to app-routing.module
* add path in app-routing.module and determine which roles are allowed to read the page
* add in app-nav-component.html the page to the menu with the roles who can see the menu item

### Generate component is anders omdat we een module material.modules.ts hebben
`ng g c naam  --module=../app-routing.module`



### Overwrite local version with version from githib
git fetch --all
git reset --hard origin/master








HTML

<div class="fab-container">
  <button mat-fab color="primary" class="fab-toggler" (click)="onToggleFab()">
    <i class="material-icons">menu</i>
  </button>
  <div>
    <button *ngFor="let btn of fabButtons; index as i" #fabs id='{{i}}' mat-mini-fab (click)="onFabClick($event, i)" color="primary"
      [disabled]='fabDisabled[i]' class="fab-secondary">
      <i class="material-icons">{{btn.icon}}</i>
    </button>
  </div>
</div>

CSS 

.fab-toggler {
  float: right;
  z-index: 100;
}

#fab-dismiss {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}



  onFabClick(event, buttonNbr) {
    switch (buttonNbr) {
      case 0: // Delete
        this.onDelete();
        break;
      case 1: // Edit
        this.onEdit();
        break;
      case 2: // Copy
        this.onCopy();
        break;
      case 3: // Add
        this.onAdd();
        break;
    }
  }


    fabIcons = [
    {
      icon: 'delete'
    },
    {
      icon: 'edit'
    },
    {
      icon: 'playlist_add'
    },
    {
      icon: 'add'
    }
  ];

  fabDisabled = [];
  fabButtons = [];
  fabTogglerState = 'inactive';

  showFabItems() {
    this.fabDisabled = [this.deleteDisabled, this.editDisabled, this.editDisabled, this.addDisabled ];
    this.fabTogglerState = 'active';
    this.fabButtons = this.fabIcons;
  }

  hideFabItems() {
    this.fabTogglerState = 'inactive';
    this.fabButtons = [];
  }

  onToggleFab() {
    this.fabButtons.length ? this.hideFabItems() : this.showFabItems();
  }


  	"Comment": {
		"prefix": "///",
		"body": [
	"/***************************************************************************************************\n/ $1\n/***************************************************************************************************/\n$2"
		],
		"description": "Add comment header"
	}



###


#page-wrap { width: 300px; margin: 80px auto; }

aside {
  display: block;
  position: relative;
  margin: 40px 0;
}

aside h3 {
  font: bold 12px Sans-Serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: #369;
  color: #fff;
  padding: 5px 10px;
  margin: 0 0 10px 0;
  line-height: 24px;
}

/* Class name via Modernizr */
.csstransforms aside {
  border-left: 34px solid #369;
  padding-left: 10px;
}
.csstransforms aside h3 {
  /* Abs positioning makes it not take up vert space */
  position: absolute;
  top: 0;
  left: 0;

  /* Border is the new background */
  background: none;

  /* Rotate from top left corner (not default) */
  transform-origin: 0 0;
  transform: rotate(90deg);
}

.cssrotate {
    /* Abs positioning makes it not take up vert space */
    position: absolute;
    top: 0;
    left: 0;
  
    /* Border is the new background */
    background: none;
    
    /* Rotate from top left corner (not default) */
    transform-origin: 0 0;
    transform: rotate(90deg);
}



<div id="page-wrap" class='csstransforms aside h3'>

  <button id="fake" (click)="onclick()">Toggle Browser Support</button>

  <aside class='csstransforms aside h3'>
    <h3>Heading and stuff</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </aside>

  <aside>
    <h3>Heading and stuff</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </aside>

</div>
