window.onload = function () {
    let switcher = <HTMLInputElement>document.querySelector('.checkbox');
    let body = document.body;

    switcher.addEventListener('click', function () {
        this.checked ?  body.style.background = 'linear-gradient(90deg,#FFD3B5, #E892E4, #ADC2FF, #92E8BB, #FFFDA1)' : body.style.background = '#03A9F4';
    });

};


