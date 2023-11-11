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
  const users = document.querySelectorAll('.user');
  const userLabel = document.getElementById('user-label'); // ユーザーラベルの要素を取得

  let currentUser = null; // 現在ログインしているユーザー
  let canSelectUser = false; // ユーザーを選択できるかどうかのフラグ
  let canChangeStatus = false; // 出席状態を変更できるかどうかのフラグ

  // ページ読み込み時に出席状態を復元
  users.forEach(user => {
    const storedStatus = localStorage.getItem(user.textContent);
    if (storedStatus === 'present') {
      user.classList.add('present');
    } else if (storedStatus === 'absent') {
      user.classList.add('absent');
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
  });

  // ログアウトボタンのイベントリスナー
  logoutButton.addEventListener('click', () => {
    toggleButtonVisuals(logoutButton);
    if (currentUser) {
      currentUser.classList.remove('selected');
      currentUser = null;
      // ユーザーラベルをクリア
      userLabel.textContent = 'User: ';
    }
    canSelectUser = false;
    canChangeStatus = false;
    selectButton.disabled = false;
    loginButton.disabled = true;
    logoutButton.disabled = true;
  });

  // absent/presentボタンのイベントリスナー
  absentButton.addEventListener('click', () => {
    if (currentUser && canChangeStatus) {
      toggleButtonVisuals(absentButton);
      currentUser.classList.remove('present');
      currentUser.classList.add('absent');
      一時メッセージを表示('帰宅');
      localStorage.setItem(currentUser.textContent, 'absent');
    }
  });

  presentButton.addEventListener('click', () => {
    if (currentUser && canChangeStatus) {
      toggleButtonVisuals(presentButton);
      currentUser.classList.remove('absent');
      currentUser.classList.add('present');
      一時メッセージを表示('出席');
      localStorage.setItem(currentUser.textContent, 'present');
    }
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

  // ボタンがクリックされたときのビジュアル変化を管理する関数
  function toggleButtonVisuals(button) {
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 2000); // 2秒後にビジュアルをリセット
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
  function 一時メッセージを表示(ステータス) {
    const currentTimeDisplay = document.getElementById('current-time');
    const now = new Date();
    const timeString = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    userLabel.textContent = `User: ${currentUser.textContent} ${ステータス} ${timeString}`;

    // 5秒後にメッセージを消去
    setTimeout(() => {
      userLabel.textContent = `User: ${currentUser.textContent}`;
    }, 5000);
  }
});
