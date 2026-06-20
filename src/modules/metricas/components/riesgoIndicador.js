export function createRiesgoBar(score) {
  const numScore = Number(score) || 0;
  let bgClass = 'bg-success';
  if (numScore >= 60) {
    bgClass = 'bg-danger';
  } else if (numScore >= 35) {
    bgClass = 'bg-warning';
  }

  return `
    <div class="progress" style="height: 10px;" title="Riesgo: ${numScore}/100">
      <div class="progress-bar ${bgClass}" role="progressbar" style="width: ${numScore}%" aria-valuenow="${numScore}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
  `;
}

export function createRiesgoChip(nivel) {
  const nivelLower = (nivel || '').toLowerCase();
  let bgClass = 'bg-secondary';
  let label = 'Desconocido';

  if (nivelLower === 'alto') {
    bgClass = 'bg-danger';
    label = 'Alto';
  } else if (nivelLower === 'medio') {
    bgClass = 'bg-warning text-dark';
    label = 'Medio';
  } else if (nivelLower === 'bajo') {
    bgClass = 'bg-success';
    label = 'Bajo';
  }

  return `<span class="badge ${bgClass}">${label}</span>`;
}

export function createScoreCircle(score) {
  const numScore = Number(score) || 0;
  let bgClass = 'bg-success';
  if (numScore >= 60) {
    bgClass = 'bg-danger';
  } else if (numScore >= 35) {
    bgClass = 'bg-warning text-dark';
  }

  return `
    <div class="d-flex justify-content-center align-items-center rounded-circle ${bgClass} text-white fw-bold" style="width: 40px; height: 40px; font-size: 0.9rem;">
      ${numScore}
    </div>
  `;
}
