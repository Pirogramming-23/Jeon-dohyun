// 전역 변수들
let stopwatchTime = 0;
let stopwatchInterval = null;
let isStopwatchRunning = false;
let records = [];
let recordCount = 0;

// DOM 요소들
const stopwatchDisplay = document.getElementById("time-display");
const recordsList = document.getElementById("records-list");

// 스톱워치 버튼들
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");

// 기록 관리 요소들
const selectAllCheckbox = document.getElementById("select-all-checkbox");
const deleteBtn = document.getElementById("delete-btn");

// 시간 포맷팅 함수 (mm:ss:ms)
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
}

// 스톱워치 업데이트
function updateStopwatchDisplay() {
  stopwatchDisplay.textContent = formatTime(stopwatchTime);
}

// 스톱워치 시작
function startStopwatch() {
  if (!isStopwatchRunning) {
    isStopwatchRunning = true;
    stopwatchInterval = setInterval(() => {
      stopwatchTime += 10; // 10ms씩 증가
      updateStopwatchDisplay();
    }, 10);
  }
}

// 스톱워치 정지 (기록도 함께)
function stopStopwatch() {
  if (isStopwatchRunning) {
    isStopwatchRunning = false;
    clearInterval(stopwatchInterval);

    // 기록 추가
    if (stopwatchTime > 0) {
      recordCount++;
      const record = {
        id: recordCount,
        time: stopwatchTime,
        timeString: formatTime(stopwatchTime),
      };
      records.push(record);
      renderRecords();
    }
  }
}

// 스톱워치 리셋
function resetStopwatch() {
  isStopwatchRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchTime = 0;
  updateStopwatchDisplay();
}

// 기록 렌더링
function renderRecords() {
  if (records.length === 0) {
    recordsList.innerHTML = '<div class="empty-message">기록이 없습니다.</div>';
    updateSelectAllCheckbox();
    return;
  }

  recordsList.innerHTML = records
    .map(
      (record) => `
        <div class="record-item">
            <div class="record-left">
                <input type="checkbox" class="record-checkbox" data-id="${record.id}">
                <span class="record-time">${record.timeString}</span>
            </div>
        </div>
    `
    )
    .join("");

  // 기록이 변경될 때마다 전체 선택 체크박스 상태 갱신
  updateSelectAllCheckbox();
}

// 전체 선택/해제 (체크박스)
function toggleSelectAll() {
  const checkboxes = document.querySelectorAll(".record-checkbox");
  const isChecked = selectAllCheckbox.checked;

  checkboxes.forEach((cb) => {
    cb.checked = isChecked;
  });

  // 사용자가 직접 토글했으므로 상태 확정
  updateSelectAllCheckbox();
}

// 개별 체크박스 상태에 따른 전체 선택 체크박스 업데이트
function updateSelectAllCheckbox() {
  const checkboxes = document.querySelectorAll(".record-checkbox");
  const checkedCount = document.querySelectorAll(
    ".record-checkbox:checked"
  ).length;

  if (checkboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === checkboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

// 선택된 기록 삭제
function deleteSelectedRecords() {
  const selectedIds = Array.from(
    document.querySelectorAll(".record-checkbox:checked")
  ).map((cb) => parseInt(cb.dataset.id));

  if (selectedIds.length > 0) {
    records = records.filter((record) => !selectedIds.includes(record.id));
    renderRecords();
    updateSelectAllCheckbox();
  }
}

// 이벤트 리스너들
startBtn.addEventListener("click", startStopwatch);
stopBtn.addEventListener("click", stopStopwatch);
resetBtn.addEventListener("click", resetStopwatch);

selectAllCheckbox.addEventListener("change", toggleSelectAll);
deleteBtn.addEventListener("click", deleteSelectedRecords);

// 체크박스 상태 변경 감지
recordsList.addEventListener("change", (e) => {
  if (e.target.classList.contains("record-checkbox")) {
    updateSelectAllCheckbox();
  }
});

// 초기화
updateStopwatchDisplay();
renderRecords();
updateSelectAllCheckbox();


