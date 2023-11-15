window.addEventListener('DOMContentLoaded', (event) => {
  // 時間と日付を更新する関数
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000); // 1分ごとに時間と日付を更新

  // ボタンの要素を取得
  const selectButton = document.getElementById('select-button');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const absentButton = document.getElementById('absent-button');
  const presentButton = document.getElementById('present-button');
  const loadButton = document.getElementById('load-button');
  const deleteButton = document.getElementById('delete-button');
  const users = document.querySelectorAll('.user');
  const userLabel = document.getElementById('user-label'); // ユーザーラベルの要素を取得

  // ヘッダー行のカラムを追加
  const tableColumns = ['日付', 'ユーザー', '出席時刻', '欠席時刻', '滞在時間']; 

  let currentUser = null; // 現在ログインしているユーザー
  let canSelectUser = false; // ユーザーを選択できるかどうかのフラグ
  let canChangeStatus = false; // 出席状態を変更できるかどうかのフラグ

// ページ読み込み時に出席状態を復元
users.forEach(user => {
  const storedData = JSON.parse(localStorage.getItem('attendanceData')) || [];
  const currentDate = getCurrentDateWithDay();
  const userData = storedData.find(entry => entry.userId === user.textContent && entry.date === currentDate);
  if (userData) {
    if (userData.status === 'present') {
      user.classList.add('present');
      user.classList.remove('absent');
    } else if (userData.status === 'absent') {
      user.classList.add('absent');
      user.classList.remove('present');
    }
  }
});

  // Selectボタンのイベントリスナー
  selectButton.addEventListener('click', () => {
    toggleButtonVisuals(selectButton);
    canSelectUser = true;
    selectButton.disabled = true;
    loginButton.disabled = false;
    canChangeStatus = false;
  });

  // ユーザー選択のイベントリスナーを設定
  users.forEach(user => {
    user.addEventListener('click', () => {
      if (canSelectUser) {
        if (currentUser) {
          currentUser.classList.remove('selected');
        }
        currentUser = user;
        currentUser.classList.add('selected');
        loginButton.disabled = false;
      }
    });
  });

  // ログインボタンのイベントリスナー
  loginButton.addEventListener('click', () => {
    toggleButtonVisuals(loginButton);
    if (currentUser) {
      canSelectUser = false;
      canChangeStatus = true;
      loginButton.disabled = true;
      logoutButton.disabled = false;
      // ユーザーラベルを更新
      userLabel.textContent = `User: ${currentUser.textContent}`;
    }
      // 選択されたユーザーの出席データのみを表示
      displayUserAttendanceData(currentUser.textContent);
      // 表を表示する
      document.getElementById('attendance-table').style.display = '';
  });

  // ログアウトボタンのイベントリスナー
  logoutButton.addEventListener('click', () => {
    toggleButtonVisuals(logoutButton);
    if (currentUser) {
      currentUser.classList.remove('selected');
      currentUser = null;
      // ユーザーラベルをクリア
      userLabel.textContent = 'User: ';
      // 表を非表示にする
      document.getElementById('attendance-table').style.display = 'none';
    }
    // ログイン、ログアウト、選択ボタンの状態をリセット
    canSelectUser = false;
    canChangeStatus = false;
    selectButton.disabled = false;
    loginButton.disabled = true;
    logoutButton.disabled = true;
  });

  // absentボタンのイベントリスナー
  absentButton.addEventListener('click', () => {
    if (currentUser && canChangeStatus && !currentUser.classList.contains('absent')) {
      currentUser.classList.add('absent');
      currentUser.classList.remove('present');
      const statusTime = getCurrentDateTime();
      saveAndDisplayAttendanceData(currentUser.textContent, 'absent', statusTime);
      一時メッセージを表示('帰宅', statusTime);
    }
  });

  // presentボタンのイベントリスナー
  presentButton.addEventListener('click', () => {
    if (currentUser && canChangeStatus && !currentUser.classList.contains('present')) {
      currentUser.classList.add('present');
      currentUser.classList.remove('absent');
      localStorage.setItem(currentUser.textContent, 'present');
      const statusTime = getCurrentDateTime();
      saveAndDisplayAttendanceData(currentUser.textContent, 'present', statusTime);
      saveAndDisplayAttendanceData(user.textContent, 'absent', statusTime);
      一時メッセージを表示('出席', statusTime);
    }
  });

  // Loadボタンのイベントリスナー
  loadButton.addEventListener('click', () => {
    if (currentUser) {
      displayUserAttendanceData(currentUser.textContent);
    } else {
      // currentUserがnullの場合、何もしないか、または他の適切な動作を行う
    }
  });
    
  // Deleteボタンのイベントリスナー
  deleteButton.addEventListener('click', () => {
    // ローカルストレージから出席データを削除し、表をクリアする
    localStorage.removeItem('attendanceData');
    displayUserAttendanceData(currentUser ? currentUser.textContent : null);
  });

// データの保存と表示を管理するための関数
function saveAndDisplayAttendanceData(userId, status) {
  let data = JSON.parse(localStorage.getItem('attendanceData')) || [];
  let currentDate = getCurrentDateWithDay(); // 日付を取得
  let currentTime = getCurrentDateTime(); // 現在の時刻を取得
  let existingEntry = data.find(entry => entry.userId === userId && entry.date === currentDate);

  if (existingEntry && existingEntry.presentTime !== 'なし' && existingEntry.absentTime !== 'なし') {
    let newEntry = {
      date: currentDate,
      userId: userId,
      status: status,
      presentTime: status === 'present' ? currentTime : 'なし',
      absentTime: status === 'absent' ? currentTime : 'なし'
    };
    data.unshift(newEntry);
  } else if (existingEntry) {
    if (status === 'absent') {
      existingEntry.absentTime = currentTime;
    } else if (status === 'present') {
      existingEntry.presentTime = currentTime;
    }
    existingEntry.status = status;
  } else {
    let newEntry = {
      date: currentDate,
      userId: userId,
      status: status,
      presentTime: status === 'present' ? currentTime : 'なし',
      absentTime: status === 'absent' ? currentTime : 'なし'
    };
    data.unshift(newEntry);
  }

  localStorage.setItem('attendanceData', JSON.stringify(data));
  displayUserAttendanceData(userId);
}

// 表に特定のユーザーのデータを表示する関数
function displayUserAttendanceData(userId) {
  const table = document.getElementById('attendance-table');
  const tableBody = table.getElementsByTagName('tbody')[0];
  const allData = JSON.parse(localStorage.getItem('attendanceData')) || [];
  const userData = allData.filter(item => item.userId === userId);

  // テーブルの既存のデータをクリア
  tableBody.innerHTML = '';

  // ヘッダー行が既に存在するか確認し、存在しなければ作成
  if (table.getElementsByTagName('thead').length === 0) {
    const tableHead = table.createTHead();
    const headerRow = tableHead.insertRow(0);
    const tableColumns = ['日付', 'ユーザー', '出席時刻', '欠席時刻'];

    tableColumns.forEach(columnName => {
      let headerCell = document.createElement('th');
      headerCell.textContent = columnName;
      headerRow.appendChild(headerCell);
    });
  }

 // userDataの各アイテムを表に追加
 userData.forEach(item => {
  let row = tableBody.insertRow(-1);
  tableColumns.forEach(columnName => {
    let cell = row.insertCell(-1);
    switch(columnName) {
      case '日付':
        cell.textContent = item.date; // 日付を表示
        break;
        case 'ユーザー':
          cell.textContent = item.userId;
          break;
        case '出席時刻':
          cell.textContent = item.presentTime; // 'なし' または実際の時刻を表示
          break;
        case '欠席時刻':
          cell.textContent = item.absentTime; // 'なし' または実際の時刻を表示
          break;
        case '滞在時間':
        // 出席時刻と欠席時刻が両方ある場合のみ計算
        if (item.presentTime !== 'なし' && item.absentTime !== 'なし') {
          let duration = calculateDuration(item.presentTime, item.absentTime);
          cell.textContent = duration;
        } else {
          cell.textContent = '---'; // 情報が不足している場合は表示しない
        }
        break;
      }
    });
  });
}

  // すべてのユーザーの出席データを表示する関数
  function displayAttendanceData() {
    const table = document.getElementById('attendance-table');
    const tableBody = table.getElementsByTagName('tbody')[0];
    const allData = JSON.parse(localStorage.getItem('attendanceData')) || [];

    // テーブルの既存のデータをクリア
    tableBody.innerHTML = '';

    // allDataの各アイテムを表に追加
    allData.forEach(item => {
      let row = tableBody.insertRow(-1);
      tableColumns.forEach(columnName => {
        let cell = row.insertCell(-1);
        switch(columnName) {
          case '日付':
            cell.textContent = item.date; // 日付を表示
            break;
          case 'ユーザー':
            cell.textContent = item.userId;
            break;
          case '出席時刻':
            cell.textContent = item.presentTime; // 'なし' または実際の時刻を表示
            break;
          case '欠席時刻':
            cell.textContent = item.absentTime; // 'なし' または実際の時刻を表示
            break;
          case '滞在時間':
            // 出席時刻と欠席時刻が両方ある場合のみ計算
            if (item.presentTime !== 'なし' && item.absentTime !== 'なし') {
              let duration = calculateDuration(item.presentTime, item.absentTime);
              cell.textContent = duration;
            } else {
              cell.textContent = '---'; // 情報が不足している場合は表示しない
            }
            break;
        }
      });
    });
  }
  
  // ページ読み込み時に表を更新
  displayAttendanceData();

  // ボタンがクリックされたときのビジュアル変化を管理する関数
  function toggleButtonVisuals(button) {
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 2000); // 2秒後にビジュアルをリセット
  }

// 現在の時刻を取得する関数
function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

// 現在の日付と曜日を取得する関数
function getCurrentDateWithDay() {
  const now = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayString = `(${days[now.getDay()]})`; // 曜日を取得
  return `${now.toLocaleDateString('ja-JP')} ${dayString}`;
}

  // 時間と日付を更新する関数
  function updateCurrentTime() {
    const currentTimeDisplay = document.getElementById('current-time');
    const currentDateDisplay = document.getElementById('current-date');
    const now = new Date();
    const timeString = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    // 日本語での曜日の配列
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    // 現在の曜日を取得して配列から取り出す
    const dayString = `(${days[now.getDay()]})`;

    const dateString = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) + dayString;

    currentDateDisplay.textContent = `日付: ${dateString}`;
    currentTimeDisplay.textContent = `時間: ${timeString}`;
  }

  // 一時メッセージを表示する関数
  function 一時メッセージを表示(ステータス, 時刻) {
    userLabel.textContent = `User: ${currentUser.textContent} ${ステータス} ${時刻}`;

    // 5秒後にメッセージを消去
    setTimeout(() => {
      userLabel.textContent = `User: ${currentUser.textContent}`;
    }, 5000);
  }

  // 出席・欠席データを保存する関数
  function saveAttendanceData(userId, status, timestamp) {
    let data = JSON.parse(localStorage.getItem('attendanceData')) || [];
    data.push({ userId, status, timestamp });
    localStorage.setItem('attendanceData', JSON.stringify(data));
  }
});

// 滞在時間を計算する関数
function calculateDuration(startTime, endTime) {
  let start = new Date(`01/01/2000 ${startTime}`);
  let end = new Date(`01/01/2000 ${endTime}`);
  let duration = (end - start) / (1000 * 60 * 60); // ミリ秒を時間に変換
  return duration.toFixed(1) + 'h'; // 小数点以下1桁に丸めて時間単位で返す
}
