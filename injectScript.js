

const carousel = document.getElementById('kt_slider_widget');
const carouselInner = carousel.querySelector('.carousel-inner');

const carouselItem = document.createElement('div');
carouselItem.className = 'carousel-item min-h-400px min-h-md-500px';

const card = document.createElement('div');
card.className = 'card border-0 h-100';
card.setAttribute('data-bs-theme', 'light');
card.style = 'background: linear-gradient(112.14deg, #b66eff 0%, #8a14ff 100%); min-height: 100%;';

const cardBody = document.createElement('div');
cardBody.className = 'card-body d-flex flex-column justify-content-center';

const cardRow = document.createElement('div');
cardRow.className = 'row align-items-center h-100';

const fCol = document.createElement('div');
fCol.className = 'col-7 ps-xl-13';

const sCOl = document.createElement('div');
sCOl.className = 'col-5 pt-10';

const fColHTML = `
    <div class="text-white mb-6">
        <span class="fs-2qx fw-bold">Çalışma Alanı</span>
    </div>
    <span class="fw-semibold text-white fs-6 mb-8 d-block opacity-75">
        Hemen çalışma yerinizi ayırın.
    </span>
    <div class="d-flex align-items-center flex-wrap d-grid gap-2 mb-10 mb-xl-20">
        <div class="d-flex align-items-center">
            <div class="symbol symbol-30px symbol-circle me-3">
                <span class="symbol-label d-flex align-items-center justify-content-center" style="background: #DB2B2B;">
                    <i class="ki-duotone ki-abstract-26 fs-5 text-white">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </span>
            </div>
            <div class="text-white">
                <span class="fw-semibold opacity-75 d-block fs-8">Online Rezervasyon</span>
            </div>
        </div>
    </div>
    <div class="d-flex flex-column flex-sm-row d-grid gap-2">
        <a href="http://localhost:3000/" class="btn btn-success flex-shrink-0 text-white box">Rezervasyon Yap</a>
    </div>`;

fCol.innerHTML = fColHTML;

cardRow.appendChild(fCol);
cardRow.appendChild(sCOl);

cardBody.appendChild(cardRow);

card.appendChild(cardBody);

carouselItem.appendChild(card);

carouselInner.appendChild(carouselItem);


