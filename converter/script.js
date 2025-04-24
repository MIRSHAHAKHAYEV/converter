document.addEventListener('DOMContentLoaded', async () => {
    // DOM elementlərini seçirik
    const rightButtons = document.querySelectorAll('.right-buttons>button');
    const leftButtons = document.querySelectorAll('.left-buttons>button');
    const leftFooterWrapper = document.querySelector('.left-footer-wrapper');
    const rightFooterWrapper = document.querySelector('.right-footer-wrapper');
    const leftInput = document.querySelector('.left-input');
    const rightInput = document.querySelector('.right-input');
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerWrapper = document.querySelector('.hamburger-wrapper');
    const API_KEY = "0914d85c7a202519ec8ee561089f1652"; // Valyuta məzənnələri üçün API açarı
    const errorWrapper = document.querySelector('.error-wrapper');
    let leftRate, rightRate; // Konversiya məzənnələri üçün dəyişənlər
    let activeInput = "left"; // Hansı input sahəsinin aktiv olduğunu izləyirik

    // Aktiv inputa əsasən digər inputun dəyərini yeniləyən funksiya
    function updateDependentInput() {
        if (activeInput === "left" && leftInput.value !== "") {
            const calculatedValue = (leftInput.value * leftRate).toFixed(5);
            if (!isNaN(calculatedValue)) {
                rightInput.value = calculatedValue;
            }
        } else if (activeInput === "right" && rightInput.value !== "") {
            const calculatedValue = (rightInput.value * rightRate).toFixed(5);
            if (!isNaN(calculatedValue)) {
                leftInput.value = calculatedValue;
            }
        }
    }

    // Sol tərəfdəki valyuta düymələrinə klikləmə hadisəsi
    leftButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            button.classList.add('active'); 
            leftButtons.forEach((btn) => {
                if (btn !== button) btn.classList.remove('active');
            });
            await updateFooters(); 
            updateDependentInput();
        });
    });

    // Sağ tərəfdəki valyuta düymələrinə klikləmə hadisəsi
    rightButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            button.classList.add('active'); 
            rightButtons.forEach((btn) => {
                if (btn !== button) btn.classList.remove('active'); 
            });
            await updateFooters();
            updateDependentInput(); 
        });
    });

    // Sol input sahəsində dəyişiklik olduqda
    leftInput.addEventListener('input', (e) => {
        activeInput = "left";
        if (e.target.value.includes(',')) {
            e.target.value = e.target.value.replace(',', '.');
        }
        const calculatedValue = (e.target.value * leftRate).toFixed(5);
        if (!isNaN(calculatedValue)) {
            rightInput.value = calculatedValue;
        } else {
            rightInput.value = "";
        }
    });

    // Sağ input sahəsində dəyişiklik olduqda
    rightInput.addEventListener('input', (e) => {
        activeInput = "right";
        if (e.target.value.includes(',')) {
            e.target.value = e.target.value.replace(',', '.');
        }
        console.log(e.target.value);
        const calculatedValue = (e.target.value * rightRate).toFixed(5);
        if (!isNaN(calculatedValue)) {
            leftInput.value = calculatedValue;
        } else {
            leftInput.value = "";
        }
    });

    // Valyuta məzənnələrini yeniləyən funksiya
    async function updateFooters() {
        const leftActive = document.querySelector('.left-buttons > button.active');
        const rightActive = document.querySelector('.right-buttons > button.active');
        if (leftActive && rightActive) {
            if (leftActive.innerText !== rightActive.innerText) {
                const leftCurrency = leftActive.textContent.trim(); 
                const rightCurrency = rightActive.textContent.trim(); 

                // API URL-ni qururuq
                const leftURL = `https://api.exchangerate.host/live?access_key=${API_KEY}&source=${leftCurrency}&currencies=${rightCurrency}`;
                try {
                    const response = await fetch(leftURL); 
                    const leftData = await response.json(); 

                    if (leftData.success) {
                        leftRate = leftData.quotes[`${leftCurrency}${rightCurrency}`].toFixed(5); 
                        rightRate = (1 / leftRate).toFixed(5); 
                        leftFooterWrapper.innerText = `1 ${leftCurrency} = ${leftRate} ${rightCurrency}`; 
                        rightFooterWrapper.innerText = `1 ${rightCurrency} = ${rightRate} ${leftCurrency}`; 
                    } else {
                        console.error('Sol məlumatı çəkilmədi:', leftData.error); // Əgər məlumat alınmazsa, xətanı qeyd edirik
                    }
                } catch (error) {
                    console.error('Məlumat alınarkən xəta baş verdi:', error); // API çağırışında xəta baş verərsə, onu qeyd edirik
                }
            } else {
                leftRate = 1; // Əgər hər iki valyuta eynidirsə, məzənnəni 1 olaraq təyin edirik
                rightRate = 1;
                leftFooterWrapper.innerText = `1 ${leftActive.innerText} = 1 ${rightActive.innerText}`; 
                rightFooterWrapper.innerText = `1 ${rightActive.innerText} = 1 ${leftActive.innerText}`;
            }
        }
    }

    // Şəbəkə statusunu yeniləyən funksiya
    function updateNetworkStatus() {
        if (navigator.onLine) {
            errorWrapper.style.display = 'none'; 
        } else {
            errorWrapper.style.display = 'block'; 
        }
    }

    // Şəbəkə vəziyyətini izləyirik
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); 

    // Default seçilmiş düymələri təyin edirik
    const defaultLeftButton = Array.from(leftButtons).find(button => button.textContent.trim() === "RUB");
    const defaultRightButton = Array.from(rightButtons).find(button => button.textContent.trim() === "USD");

    if (defaultLeftButton) defaultLeftButton.classList.add('active');
    if (defaultRightButton) defaultRightButton.classList.add('active');

    await updateFooters(); 
    updateDependentInput(); 
});
