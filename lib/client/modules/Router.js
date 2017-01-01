module.exports = class Router {
  constructor() {
    this._newContent = null;
    this._newContentPromise = Promise.resolve();
    this._viewElement = document.querySelector('section.view-content');
    this._isAnimatingOut = false;
    this._isAnimatingIn = false;
    this._spinnerTimeout = 0;
    this._currentPath = window.location.pathname;

    this._boostrapNavigation();
    this._onChanged();
  }

  _queueSpinner() {
    this._spinnerTimeout = setTimeout(() => {
      document.body.classList.add('view-pending');
    }, 500);
  }

  _hideSpinner() {
    document.body.classList.remove('view-pending');
    clearTimeout(this._spinnerTimeout);
  }

  _onChanged() {
    console.log(`Router::_onChanged(${window.location.pathname})`);
    if (this._currentPath === window.location.pathname) {
      console.log('Bumping request');
      return Promise.resolve();
    }

    this._currentPath = window.location.pathname;

    this._newContentPromise = this._loadAsyncView();

    if (this._isAnimatingOut) {
      console.log(' Either animating out or loading still - sorry');
      return Promise.resolve();
    }

    this._isAnimatingOut = true;
    return this._animateOut().then(() => {
      console.log('Router::_animateOut complete');
      this._isAnimatingOut = false;
      return this._newContentPromise;
    }).then(() => {
      console.log(`Async View Resolved With ${this._newContent.getAttribute('id')}`);
      this._viewElement.innerHTML = this._newContent.innerHTML;
      this._animatingIn = true;
      return this._animateIn();
    }).then(() => {
      console.log('Router::_animateIn complete');
      this._animatingIn = false;
    }).catch(error => {
      console.warn(error);
    });
  }

  _loadAsyncView() {
    console.log(`Router::_loadAsyncView(${this._currentPath})`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = evt => {
        this._newContent = evt.target.response.querySelector('div[view]');
        console.log(this._newContent);
        resolve();
      };

      xhr.onerror = reject;

      xhr.responseType = 'document';
      console.log(`XHR open`);
      xhr.open('GET', `${this._currentPath}${this._currentPath.endsWith('/') ? '' : '/'}?partial`);
      xhr.send();
    });
  }

  _animateIn() {
    console.log('Router::_animateIn()');
    this._hideSpinner();

    return new Promise((resolve, reject) => {
      const onTransitionEnd = () => {
        this._viewElement.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };

      this._viewElement.classList.add('visible');
      this._viewElement.addEventListener('transitionend', onTransitionEnd);
    });
  }

  _animateOut() {
    console.log(`Router::_animateOut()`);
    if (document.body.classList.contains('view-pending')) {
      console.log('Already pending - not going to anim out');
      return Promise.resolve();
    }
    this._queueSpinner();

    return new Promise((resolve, reject) => {
      const onTransitionEnd = () => {
        this._viewElement.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };

      this._viewElement.classList.remove('visible');
      this._viewElement.addEventListener('transitionend', onTransitionEnd);

    });
  }

  go(url) {
    window.history.pushState(null, null, url);
    return this._onChanged();
  }

  _boostrapNavigation() {
    window.addEventListener('popstate', this._onChanged.bind(this));
    Array.prototype.forEach.call(document.querySelectorAll('.header .header-content nav li'), link => {
      console.log('Attaching listener');

      // Plain old li click listener
      link.addEventListener('click', evt => {
        this.go(evt.target.firstChild.href);
      });

      /**
       * If the user clicks a link inside a list item
       * that link will be the `.target` of the event
       * passed into the onClick function - however we
       * always want to call onClick with the list item
       * as the event target so we can get its firstChild's
       * href
       */
      link.firstChild.addEventListener('click', evt => {
        evt.preventDefault();
        evt.stopPropagation(); // prevents us from triggering li click again on bubble stage
        link.click();
      });
    });
  }
}
