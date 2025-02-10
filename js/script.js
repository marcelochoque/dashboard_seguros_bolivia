 // Columnas numéricas disponibles en el CSV (acumuladas en origen)
 const dataColumns = [
  "Producción Directa Neta Anulaciones",
  "Producción Aceptada en Reaseguro",
  "Producción Total Suscrita",
  "Producción Cedida a Reaseguro",
  "Producción Neta Retenida",
  "Siniestros Directos",
  "Siniestros por Reaseguro Aceptado",
  "Siniestros Totales",
  "Siniestros Reembolsados por Reaseguro Cedido",
  "Siniestros Neto Retenido"
];

// Orden cronológico de los meses en español
const monthOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

let dataInsurance = [];  // Datos del CSV (transformados a mensual)
let lineChart, barChart, pieChart;
let ratioSiniestralidadChart, tasaCersionChart;  // Nuevas instancias para los últimos gráficos

// Funciones para poblar selects con opción "Todas"
function populateInsuranceDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";
  // Para el gráfico de línea, se agrega "Todas" al inicio
  const allOption = document.createElement("option");
  allOption.value = "Todas";
  allOption.text = "Todas";
  dropdown.appendChild(allOption);
  const uniqueEntities = [...new Set(dataInsurance.map(row => row["Entidad Aseguradora"]))];
  uniqueEntities.forEach(entity => {
    const option = document.createElement("option");
    option.value = entity;
    option.text = entity;
    dropdown.appendChild(option);
  });
}
function populateMetricDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";
  dataColumns.forEach(metric => {
    const option = document.createElement("option");
    option.value = metric;
    option.text = metric;
    dropdown.appendChild(option);
  });
}
function populateMonthDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";
  monthOrder.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.text = month;
    dropdown.appendChild(option);
  });
}
// Funciones para selects con opción "Todas" (para Ratio y Tasa)
function populateInsuranceDropdownWithAll(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "Todas";
  allOption.text = "Todas";
  dropdown.appendChild(allOption);
  const uniqueEntities = [...new Set(dataInsurance.map(row => row["Entidad Aseguradora"]))];
  uniqueEntities.forEach(entity => {
    const option = document.createElement("option");
    option.value = entity;
    option.text = entity;
    dropdown.appendChild(option);
  });
}
function populateMonthDropdownWithAll(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "Todas";
  allOption.text = "Todas";
  dropdown.appendChild(allOption);
  monthOrder.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.text = month;
    dropdown.appendChild(option);
  });
}

// --- GRÁFICOS ---
// Gráfico de línea: Evolución Temporal por Entidad
// Si se selecciona "Todas", se generan datasets para cada entidad; de lo contrario, se muestra solo la seleccionada.
function updateLineChart() {
  const selectedEntity = document.getElementById("lineAseguradoraSelect").value;
  const selectedMetric = document.getElementById("lineMetricSelect").value;
  const ctx = document.getElementById("lineChartCanvas").getContext("2d");
  if (lineChart) lineChart.destroy();

  if (selectedEntity === "Todas") {
    const labels = monthOrder;
    const entities = [...new Set(dataInsurance.map(row => row["Entidad Aseguradora"]))];
    const datasets = entities.map((entity, index) => {
      const entityRows = dataInsurance.filter(row => row["Entidad Aseguradora"] === entity);
      const dataValues = monthOrder.map(m => {
        const row = entityRows.find(r => r["Mes"] === m);
        return row ? (typeof row[selectedMetric] === 'number' ? row[selectedMetric] : parseFloat(row[selectedMetric]) || 0) : 0;
      });
      const colors = [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ];
      const borderColor = colors[index % colors.length];
      return {
        label: entity,
        data: dataValues,
        borderColor: borderColor,
        backgroundColor: borderColor,
        fill: false,
        tension: 0.3,
        pointRadius: 6
      };
    });

    lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: false } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Miles de dólares" },
            ticks: { callback: value => '$' + (value / 1000).toFixed(0) + 'k' }
          }
        },
        plugins: { legend: { display: true } }
      }
    });
  } else {
    const filteredData = dataInsurance
      .filter(row => row["Entidad Aseguradora"] === selectedEntity)
      .sort((a, b) => monthOrder.indexOf(a["Mes"]) - monthOrder.indexOf(b["Mes"]));
    const labels = filteredData.map(row => row["Mes"]);
    const dataValues = filteredData.map(row => {
      const val = row[selectedMetric];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0)',
          fill: false,
          tension: 0.3,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: false } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Miles de dólares" },
            ticks: { callback: value => '$' + (value / 1000).toFixed(0) + 'k' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

// Gráfico de columnas: Comparación de Métrica por Entidad en un Mes
function updateBarChart() {
  const selectedMonth = document.getElementById("barMonthSelect").value;
  const selectedMetric = document.getElementById("barMetricSelect").value;
  const filteredData = dataInsurance
    .filter(row => row["Mes"] === selectedMonth)
    .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  const labels = filteredData.map(row => row["Entidad Aseguradora"]);
  const dataValues = filteredData.map(row => {
    const val = row[selectedMetric];
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  });
  const ctx = document.getElementById("barChartCanvas").getContext("2d");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, font: { size: 10 } },
          title: { display: false }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Miles de dólares" },
          ticks: { callback: value => '$' + (value / 1000).toFixed(0) + 'k' }
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          offset: 4,
          color: '#000000',
          font: { weight: 'bold', size: 10 },
          formatter: value => '$' + (value / 1000).toFixed(1) + 'k'
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// Gráfico tipo 'pie': Distribución de Métrica por Entidad en un Mes
function updatePieChart() {
  const selectedMonth = document.getElementById("pieMonthSelect").value;
  const selectedMetric = document.getElementById("pieMetricSelect").value;
  const filteredData = dataInsurance.filter(row => row["Mes"] === selectedMonth);
  const labels = filteredData.map(row => row["Entidad Aseguradora"]);
  const dataValues = filteredData.map(row => {
    const val = row[selectedMetric];
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  });
  const ctx = document.getElementById("pieChartCanvas").getContext("2d");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        radius: '70%',
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(255, 102, 102, 0.7)',
          'rgba(102, 255, 102, 0.7)',
          'rgba(102, 102, 255, 0.7)',
          'rgba(255, 255, 102, 0.7)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'right' },
        datalabels: {
          formatter: (value, context) => {
            const dataArr = context.dataset.data;
            const total = dataArr.reduce((acc, val) => acc + val, 0);
            const percentage = (value / total * 100).toFixed(1) + '%';
            return percentage;
          },
          anchor: 'end',
          align: 'end',
          offset: 10,
          connector: { display: true, lineColor: '#000000', lineWidth: 1, length: 10 },
          color: '#000',
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// Gráfico de Ratio de Siniestralidad
function updateRatioSiniestralidadChart() {
  const selectedEntity = document.getElementById("ratioEntidadSelect").value;
  const selectedMonth = document.getElementById("ratioMonthSelect").value;
  const ctx = document.getElementById('ratioSiniestralidadChart').getContext('2d');
  if (ratioSiniestralidadChart) ratioSiniestralidadChart.destroy();
  let labels = [], datasetValues = [];

  if (selectedMonth === "Todas") {
    labels = monthOrder;
    datasetValues = monthOrder.map(month => {
      let monthData = dataInsurance.filter(row => row["Mes"] === month);
      if (selectedEntity !== "Todas") {
        monthData = monthData.filter(row => row["Entidad Aseguradora"] === selectedEntity);
      }
      const totalSiniestros = monthData.reduce((acc, row) => acc + (parseFloat(row["Siniestros Neto Retenido"]) || 0), 0);
      const totalProduccion = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Neta Retenida"]) || 0), 0);
      return totalProduccion !== 0 ? (totalSiniestros / totalProduccion * 100) : 0;
    });
    ratioSiniestralidadChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ratio de Siniestralidad (%)',
          data: datasetValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.3,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Porcentaje' },
            ticks: { callback: value => value.toFixed(1) + '%' }
          }
        }
      }
    });
  } else {
    labels = [selectedMonth];
    let monthData = dataInsurance.filter(row => row["Mes"] === selectedMonth);
    if (selectedEntity !== "Todas") {
      monthData = monthData.filter(row => row["Entidad Aseguradora"] === selectedEntity);
    }
    const totalSiniestros = monthData.reduce((acc, row) => acc + (parseFloat(row["Siniestros Neto Retenido"]) || 0), 0);
    const totalProduccion = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Neta Retenida"]) || 0), 0);
    const value = totalProduccion !== 0 ? (totalSiniestros / totalProduccion * 100) : 0;
    datasetValues = [value];
    ratioSiniestralidadChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ratio de Siniestralidad (%)',
          data: datasetValues,
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Porcentaje' },
            ticks: { callback: value => value.toFixed(1) + '%' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

// Gráfico de Tasa de Cesión
function updateTasaCersionChart() {
  const selectedEntity = document.getElementById("tasaEntidadSelect").value;
  const selectedMonth = document.getElementById("tasaMonthSelect").value;
  const ctx = document.getElementById('tasaCersionChart').getContext('2d');
  if (tasaCersionChart) tasaCersionChart.destroy();
  let labels = [], datasetValues = [];

  if (selectedMonth === "Todas") {
    labels = monthOrder;
    datasetValues = monthOrder.map(month => {
      let monthData = dataInsurance.filter(row => row["Mes"] === month);
      if (selectedEntity !== "Todas") {
        monthData = monthData.filter(row => row["Entidad Aseguradora"] === selectedEntity);
      }
      const totalCedido = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Cedida a Reaseguro"]) || 0), 0);
      const totalProduccion = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Total Suscrita"]) || 0), 0);
      return totalProduccion !== 0 ? (totalCedido / totalProduccion * 100) : 0;
    });
    tasaCersionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tasa de Cesión a Reaseguro (%)',
          data: datasetValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.3,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Porcentaje' },
            ticks: { callback: value => value.toFixed(1) + '%' }
          }
        }
      }
    });
  } else {
    labels = [selectedMonth];
    let monthData = dataInsurance.filter(row => row["Mes"] === selectedMonth);
    if (selectedEntity !== "Todas") {
      monthData = monthData.filter(row => row["Entidad Aseguradora"] === selectedEntity);
    }
    const totalCedido = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Cedida a Reaseguro"]) || 0), 0);
    const totalProduccion = monthData.reduce((acc, row) => acc + (parseFloat(row["Producción Total Suscrita"]) || 0), 0);
    const value = totalProduccion !== 0 ? (totalCedido / totalProduccion * 100) : 0;
    datasetValues = [value];
    tasaCersionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tasa de Cesión a Reaseguro (%)',
          data: datasetValues,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Porcentaje' },
            ticks: { callback: value => value.toFixed(1) + '%' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

/**
 * Convierte datos acumulados en datos mensuales.
 * Para cada entidad, ordena sus registros por mes y
 * resta el valor del mes anterior al mes actual.
 */
function convertCumulativeToMonthly(data) {
  const grouped = {};
  data.forEach(row => {
    const entity = row["Entidad Aseguradora"];
    if (!grouped[entity]) grouped[entity] = [];
    grouped[entity].push(row);
  });
  for (const entity in grouped) {
    const arr = grouped[entity];
    arr.sort((a, b) => monthOrder.indexOf(a["Mes"]) - monthOrder.indexOf(b["Mes"]));
    for (let i = arr.length - 1; i > 0; i--) {
      for (const col of dataColumns) {
        arr[i][col] = (parseFloat(arr[i][col]) || 0) - (parseFloat(arr[i-1][col]) || 0);
      }
    }
  }
  return Object.values(grouped).flat();
}

// --- CARGA DEL CSV CON Papa Parse ---
Papa.parse("data/data_insurance_2024.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    let rawData = results.data.map(row => {
      const newRow = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          const trimmedKey = key.trim();
          let value = row[key];
          if (typeof value === "string") { value = value.trim(); }
          newRow[trimmedKey] = value;
        }
      }
      return newRow;
    });
    rawData = rawData.filter(row =>
      row["Entidad Aseguradora"] !== "Total Seguros Generales y Fianzas"
    );
    dataInsurance = convertCumulativeToMonthly(rawData);
    
    // Poblar los selects de los gráficos generales
    populateInsuranceDropdown("lineAseguradoraSelect");
    populateMetricDropdown("lineMetricSelect");
    populateMonthDropdown("barMonthSelect");
    populateMetricDropdown("barMetricSelect");
    populateMonthDropdown("pieMonthSelect");
    populateMetricDropdown("pieMetricSelect");

    // Poblar los selects de Ratio y Tasa (con opción "Todas")
    populateInsuranceDropdownWithAll("ratioEntidadSelect");
    populateMonthDropdownWithAll("ratioMonthSelect");
    populateInsuranceDropdownWithAll("tasaEntidadSelect");
    populateMonthDropdownWithAll("tasaMonthSelect");

    // Selecciones por defecto
    document.getElementById("lineAseguradoraSelect").selectedIndex = 0;
    document.getElementById("lineMetricSelect").selectedIndex = 0;
    document.getElementById("barMonthSelect").selectedIndex =
      monthOrder.indexOf("Diciembre") !== -1 ? monthOrder.indexOf("Diciembre") : 0;
    document.getElementById("barMetricSelect").selectedIndex = 0;
    document.getElementById("pieMonthSelect").selectedIndex =
      monthOrder.indexOf("Diciembre") !== -1 ? monthOrder.indexOf("Diciembre") : 0;
    document.getElementById("pieMetricSelect").selectedIndex = 0;
    // Para Ratio y Tasa, por defecto se selecciona "Todas"
    document.getElementById("ratioEntidadSelect").selectedIndex = 0;
    document.getElementById("ratioMonthSelect").selectedIndex = 0;
    document.getElementById("tasaEntidadSelect").selectedIndex = 0;
    document.getElementById("tasaMonthSelect").selectedIndex = 0;

    // Event listeners para actualizar gráficos
    document.getElementById("lineAseguradoraSelect").addEventListener("change", updateLineChart);
    document.getElementById("lineMetricSelect").addEventListener("change", updateLineChart);
    document.getElementById("barMonthSelect").addEventListener("change", updateBarChart);
    document.getElementById("barMetricSelect").addEventListener("change", updateBarChart);
    document.getElementById("pieMonthSelect").addEventListener("change", updatePieChart);
    document.getElementById("pieMetricSelect").addEventListener("change", updatePieChart);
    document.getElementById("ratioEntidadSelect").addEventListener("change", updateRatioSiniestralidadChart);
    document.getElementById("ratioMonthSelect").addEventListener("change", updateRatioSiniestralidadChart);
    document.getElementById("tasaEntidadSelect").addEventListener("change", updateTasaCersionChart);
    document.getElementById("tasaMonthSelect").addEventListener("change", updateTasaCersionChart);

    // Render inicial de los gráficos
    updateLineChart();
    updateBarChart();
    updatePieChart();
    updateRatioSiniestralidadChart();
    updateTasaCersionChart();
  },
  error: function(err) {
    console.error("Error al cargar el CSV:", err);
  }
});