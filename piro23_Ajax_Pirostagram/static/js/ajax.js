// CSRF 토큰 가져오기 함수
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// CSRF 토큰 설정
const csrftoken = getCookie("csrftoken");

// 기본 fetch 설정
function makeRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      "X-CSRFToken": csrftoken,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  };

  return fetch(url, { ...defaultOptions, ...options });
}

/**
 * 1. 게시글 좋아요 토글 기능
 */
function toggleLike(postId) {
  const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
  const likeCountEl = likeBtn
    .closest(".post-card")
    .querySelector(".like-count-text");

  // 버튼 임시 비활성화
  likeBtn.disabled = true;

  makeRequest("/api/post/like/", {
    method: "POST",
    body: JSON.stringify({ post_id: postId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const heartIcon = likeBtn.querySelector("i");

        if (data.liked) {
          // 좋아요 추가
          heartIcon.className = "fas fa-heart text-danger fs-4";
          likeBtn.classList.add("liked");
        } else {
          // 좋아요 취소
          heartIcon.className = "far fa-heart fs-4";
          likeBtn.classList.remove("liked");
        }

        // 좋아요 수 업데이트
        likeCountEl.textContent = `좋아요 ${data.total_likes}개`;

        // 애니메이션 효과
        heartIcon.style.transform = "scale(1.2)";
        setTimeout(() => {
          heartIcon.style.transform = "scale(1)";
        }, 200);
      } else {
        console.error("좋아요 처리 오류:", data.message);
        showAlert("오류가 발생했습니다. 다시 시도해주세요.", "danger");
      }
    })
    .catch((error) => {
      console.error("네트워크 오류:", error);
      showAlert("네트워크 오류가 발생했습니다.", "danger");
    })
    .finally(() => {
      // 버튼 다시 활성화
      likeBtn.disabled = false;
    });
}

/**
 * 2. 댓글 작성 기능
 */
function submitComment(postId, content) {
  if (!content.trim()) {
    showAlert("댓글 내용을 입력해주세요.", "warning");
    return;
  }

  const submitBtn = document.querySelector(
    `[data-post-id="${postId}"].comment-submit-btn`
  );
  const commentInput = document.querySelector(
    `[data-post-id="${postId}"].comment-input`
  );

  // 버튼 임시 비활성화
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner"></div>';

  makeRequest("/api/comment/create/", {
    method: "POST",
    body: JSON.stringify({
      post_id: postId,
      content: content.trim(),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        // 새 댓글 HTML 생성
        const newCommentHTML = createCommentHTML(data.comment);

        // 댓글 섹션에 추가
        const commentsSection = document.querySelector(
          `[data-post-id="${postId}"].comments-section`
        );
        commentsSection.insertAdjacentHTML("beforeend", newCommentHTML);

        // 입력창 초기화
        commentInput.value = "";

        showAlert("댓글이 등록되었습니다.", "success");
      } else {
        showAlert(data.message || "댓글 등록에 실패했습니다.", "danger");
      }
    })
    .catch((error) => {
      console.error("댓글 등록 오류:", error);
      showAlert("네트워크 오류가 발생했습니다.", "danger");
    })
    .finally(() => {
      // 버튼 원상복구
      submitBtn.disabled = false;
      submitBtn.innerHTML = "게시";
    });
}

/**
 * 3. 댓글 삭제 기능
 */
function deleteComment(commentId) {
  if (!confirm("댓글을 삭제하시겠습니까?")) {
    return;
  }

  makeRequest("/api/comment/delete/", {
    method: "POST",
    body: JSON.stringify({ comment_id: commentId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        // DOM에서 댓글 제거
        const commentElement = document.querySelector(
          `[data-comment-id="${commentId}"]`
        );
        commentElement.remove();

        showAlert("댓글이 삭제되었습니다.", "success");
      } else {
        showAlert(data.message || "댓글 삭제에 실패했습니다.", "danger");
      }
    })
    .catch((error) => {
      console.error("댓글 삭제 오류:", error);
      showAlert("네트워크 오류가 발생했습니다.", "danger");
    });
}

/**
 * 4. 대댓글 작성 기능
 */
function submitReply(commentId, content) {
  if (!content.trim()) {
    showAlert("답글 내용을 입력해주세요.", "warning");
    return;
  }

  const submitBtn = document.querySelector(
    `[data-comment-id="${commentId}"].reply-submit-btn`
  );
  const replyInput = document.querySelector(
    `[data-comment-id="${commentId}"].reply-input`
  );

  // 버튼 임시 비활성화
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="loading-spinner"></div>';

  makeRequest("/api/reply/create/", {
    method: "POST",
    body: JSON.stringify({
      comment_id: commentId,
      content: content.trim(),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        // 새 답글 HTML 생성
        const newReplyHTML = createReplyHTML(data.reply);

        // 답글 섹션에 추가
        const repliesSection = document.querySelector(
          `[data-comment-id="${commentId}"].replies-section`
        );
        repliesSection.insertAdjacentHTML("beforeend", newReplyHTML);

        // 입력창 초기화 및 숨기기
        replyInput.value = "";
        const replyForm = replyInput.closest(".reply-form");
        replyForm.style.display = "none";

        showAlert("답글이 등록되었습니다.", "success");
      } else {
        showAlert(data.message || "답글 등록에 실패했습니다.", "danger");
      }
    })
    .catch((error) => {
      console.error("답글 등록 오류:", error);
      showAlert("네트워크 오류가 발생했습니다.", "danger");
    })
    .finally(() => {
      // 버튼 원상복구
      submitBtn.disabled = false;
      submitBtn.innerHTML = "등록";
    });
}

/**
 * 5. 대댓글 삭제 기능
 */
function deleteReply(replyId) {
  if (!confirm("답글을 삭제하시겠습니까?")) {
    return;
  }

  makeRequest("/api/reply/delete/", {
    method: "POST",
    body: JSON.stringify({ reply_id: replyId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        // DOM에서 답글 제거
        const replyElement = document.querySelector(
          `[data-reply-id="${replyId}"]`
        );
        replyElement.remove();

        showAlert("답글이 삭제되었습니다.", "success");
      } else {
        showAlert(data.message || "답글 삭제에 실패했습니다.", "danger");
      }
    })
    .catch((error) => {
      console.error("답글 삭제 오류:", error);
      showAlert("네트워크 오류가 발생했습니다.", "danger");
    });
}

/**
 * 6. 실시간 검색 기능
 */
let searchTimeout;
function performSearch(query) {
  // 이전 검색 타이머 취소
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 검색어가 없으면 결과 숨기기
  if (!query.trim()) {
    hideSearchResults();
    return;
  }

  // 500ms 후에 검색 실행 (사용자 입력이 끝날 때까지 대기)
  searchTimeout = setTimeout(() => {
    fetch(`/api/search/posts/?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          displaySearchResults(data.posts, "posts");
        }
      })
      .catch((error) => {
        console.error("검색 오류:", error);
      });
  }, 500);
}

/**
 * 7. 이미지 네비게이션 기능
 */
function navigateImages(postId, direction) {
  const container = document.querySelector(
    `[data-post-id="${postId}"].post-images-container`
  );
  const images = container.querySelectorAll(".post-image");
  const indicators = document.querySelectorAll(
    `[data-post-id="${postId}"].image-indicator`
  );
  const prevBtn = container.parentElement.querySelector(".prev-btn");
  const nextBtn = container.parentElement.querySelector(".next-btn");

  // 현재 활성 이미지 찾기
  let currentIndex = 0;
  images.forEach((img, index) => {
    if (!img.classList.contains("d-none")) {
      currentIndex = index;
    }
  });

  // 새 인덱스 계산
  let newIndex;
  if (direction === "next") {
    newIndex = currentIndex + 1;
    if (newIndex >= images.length) newIndex = 0;
  } else {
    newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = images.length - 1;
  }

  // 이미지 전환
  images[currentIndex].classList.add("d-none");
  images[newIndex].classList.remove("d-none");

  // 인디케이터 업데이트
  indicators[currentIndex].classList.remove("bg-primary");
  indicators[currentIndex].classList.add("bg-secondary");
  indicators[newIndex].classList.remove("bg-secondary");
  indicators[newIndex].classList.add("bg-primary");

  // 네비게이션 버튼 표시/숨김
  prevBtn.style.display = newIndex > 0 ? "flex" : "none";
  nextBtn.style.display = newIndex < images.length - 1 ? "flex" : "none";
}

/**
 * 유틸리티 함수들
 */

// 댓글 HTML 생성 함수
function createCommentHTML(comment) {
  return `
        <div class="comment-item mb-2" data-comment-id="${comment.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <strong>${comment.author}</strong> ${comment.content}
                    <small class="text-muted d-block">${comment.created_at}</small>
                    <button class="btn btn-link btn-sm p-0 text-muted reply-toggle-btn" 
                            data-comment-id="${comment.id}">
                        답글 달기
                    </button>
                </div>
                <button class="btn btn-link btn-sm p-0 text-danger comment-delete-btn" 
                        data-comment-id="${comment.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="replies-section ms-4" data-comment-id="${comment.id}"></div>
            <div class="reply-form mt-2" style="display: none;" data-comment-id="${comment.id}">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control reply-input" 
                           placeholder="답글을 입력하세요..." data-comment-id="${comment.id}">
                    <button class="btn btn-primary reply-submit-btn" 
                            data-comment-id="${comment.id}">등록</button>
                </div>
            </div>
        </div>
    `;
}

// 답글 HTML 생성 함수
function createReplyHTML(reply) {
  return `
        <div class="reply-item mb-1" data-reply-id="${reply.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <strong>${reply.author}</strong> ${reply.content}
                    <small class="text-muted d-block">${reply.created_at}</small>
                </div>
                <button class="btn btn-link btn-sm p-0 text-danger reply-delete-btn" 
                        data-reply-id="${reply.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

// 검색 결과 표시 함수
function displaySearchResults(results, type) {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerHTML =
      '<div class="search-result-item">검색 결과가 없습니다.</div>';
  } else {
    results.forEach((item) => {
      const resultHTML = `
                <div class="search-result-item" onclick="window.location.href='/?search=${encodeURIComponent(
                  item.author
                )}'">
                    <strong>${item.author}</strong>
                    <div class="text-muted small">${item.content}</div>
                    <div class="text-muted small">좋아요 ${
                      item.total_likes
                    }개 · 댓글 ${item.total_comments}개</div>
                </div>
            `;
      searchResults.insertAdjacentHTML("beforeend", resultHTML);
    });
  }

  searchResults.style.display = "block";
}

// 검색 결과 숨기기 함수
function hideSearchResults() {
  const searchResults = document.getElementById("searchResults");
  searchResults.style.display = "none";
}

// 알림 메시지 표시 함수
function showAlert(message, type = "info") {
  const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

  // 기존 알림이 있다면 제거
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // 새 알림 추가
  const container = document.querySelector("main.container");
  container.insertAdjacentHTML("afterbegin", alertHTML);

  // 3초 후 자동 제거
  setTimeout(() => {
    const alert = document.querySelector(".alert");
    if (alert) {
      alert.remove();
    }
  }, 3000);
}

/**
 * 이벤트 리스너 등록
 */
document.addEventListener("DOMContentLoaded", function () {
  // 좋아요 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".like-btn")) {
      e.preventDefault();
      const postId = e.target.closest(".like-btn").dataset.postId;
      toggleLike(postId);
    }
  });

  // 댓글 작성 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".comment-submit-btn")) {
      e.preventDefault();
      const postId = e.target.closest(".comment-submit-btn").dataset.postId;
      const content = document.querySelector(
        `[data-post-id="${postId}"].comment-input`
      ).value;
      submitComment(postId, content);
    }
  });

  // 댓글 입력창 엔터키 이벤트
  document.addEventListener("keypress", function (e) {
    if (e.target.classList.contains("comment-input") && e.key === "Enter") {
      e.preventDefault();
      const postId = e.target.dataset.postId;
      const content = e.target.value;
      submitComment(postId, content);
    }
  });

  // 댓글 삭제 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".comment-delete-btn")) {
      e.preventDefault();
      const commentId = e.target.closest(".comment-delete-btn").dataset
        .commentId;
      deleteComment(commentId);
    }
  });

  // 답글 토글 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".reply-toggle-btn")) {
      e.preventDefault();
      const commentId = e.target.closest(".reply-toggle-btn").dataset.commentId;
      const replyForm = document.querySelector(
        `[data-comment-id="${commentId}"].reply-form`
      );
      replyForm.style.display =
        replyForm.style.display === "none" ? "block" : "none";
    }
  });

  // 답글 작성 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".reply-submit-btn")) {
      e.preventDefault();
      const commentId = e.target.closest(".reply-submit-btn").dataset.commentId;
      const content = document.querySelector(
        `[data-comment-id="${commentId}"].reply-input`
      ).value;
      submitReply(commentId, content);
    }
  });

  // 답글 입력창 엔터키 이벤트
  document.addEventListener("keypress", function (e) {
    if (e.target.classList.contains("reply-input") && e.key === "Enter") {
      e.preventDefault();
      const commentId = e.target.dataset.commentId;
      const content = e.target.value;
      submitReply(commentId, content);
    }
  });

  // 답글 삭제 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".reply-delete-btn")) {
      e.preventDefault();
      const replyId = e.target.closest(".reply-delete-btn").dataset.replyId;
      deleteReply(replyId);
    }
  });

  // 이미지 네비게이션 버튼 이벤트
  document.addEventListener("click", function (e) {
    if (e.target.closest(".image-nav-btn")) {
      e.preventDefault();
      const btn = e.target.closest(".image-nav-btn");
      const postId = btn.dataset.postId;
      const direction = btn.dataset.direction;
      navigateImages(postId, direction);
    }
  });

  // 검색 입력 이벤트
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      performSearch(e.target.value);
    });

    // 검색창 외부 클릭시 결과 숨기기
    document.addEventListener("click", function (e) {
      if (
        !e.target.closest("#searchInput") &&
        !e.target.closest("#searchResults")
      ) {
        hideSearchResults();
      }
    });
  }
});

console.log("Instagram Clone Ajax scripts loaded successfully!");
