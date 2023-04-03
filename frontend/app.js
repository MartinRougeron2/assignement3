const baseUrl = 'http://localhost:8000';

async function fetchFirstPosts() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('fetching posts...')
    let posts = await fetch(baseUrl + '/api/blog/all', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(res => res)
        .catch(error => console.error(error));
    posts = posts.reverse();
    posts = posts.slice(0, 10);
    const postsContainer = document.querySelector('.posts');
    // remove all posts
    postsContainer.innerHTML = '';
    console.log(posts)

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        // create post element
        const postElement = document.createElement('article');
        postElement.classList.add('bg-white');
        postElement.classList.add('p-4');
        postElement.classList.add('rounded');
        postElement.classList.add('shadow');
        postElement.classList.add('mb-4');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2 class="post-title row">${post.title}<i class="ml-4">Hide Content</i></h2>
            <h3 class="post-author">By ${post?.postedBy?.name || 'Anonymous'}</h3>
            <p class="post-content">${post.body}</p>
            <p class="post-date">${new Date(post.createdAt).toLocaleDateString()}</p>
        `;
        const postTitle = postElement.querySelector('.post-title');
        const postContent = postElement.querySelector('.post-content');
        postTitle.addEventListener('click', () => {
            postContent.classList.toggle('hidden');
        });
        postTitle.classList.add('text-2xl');
        postTitle.classList.add('font-bold');
        postTitle.classList.add('cursor-pointer');
        postContent.classList.add('mt-4');
        postContent.classList.add('text-gray-600');
        postContent.classList.add('text-lg');
        postContent.classList.add('bg-gray-100');
        postElement.classList.add('text-gray-600');
        postElement.classList.add('text-lg');

        // check if user is logged in and its the same user who created the post
        if (post?.postedBy?._id === user?.id) {
            // create edit button and delete button
            const editButton = document.createElement('button');
            editButton.classList.add('bg-blue-500');
            editButton.classList.add('text-white');
            editButton.classList.add('p-2');
            editButton.classList.add('rounded');
            editButton.classList.add('mr-2');
            editButton.innerHTML = 'Edit';
            // add edit form
            const editForm = document.createElement('form');
            editForm.classList.add('hidden');
            editForm.classList.add('edit-form');
            editForm.classList.add('mb-4');
            editForm.classList.add('p-4');
            editForm.classList.add('bg-grey-100');
            editForm.classList.add('rounded');
            editForm.classList.add('shadow');
            editForm.setAttribute('id', 'edit-form-' + post._id);
            editForm.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Edit Post</h2>
            <div class="flex flex-col">
                <label for="title" class="mt-4">Title</label>
                <input type="text" name="title" id="title-${post._id}" class="border border-gray-400 p-2">
                <label for="content" class="mt-4">Content</label>
                <textarea name="content" id="content-${post._id}" cols="30" rows="10" class="border border-gray-400 p-2"></textarea>
                <button type="submit" class="bg-blue-500 text-white p-2 rounded mt-4">Update</button>
            </div>
        `;
            editButton.addEventListener('click', () => {
                // show edit form
                document.querySelector('#edit-form-' + post._id).classList.remove('hidden');
                document.querySelector('#title-' + post._id).value = post.title;
                document.querySelector('#content-' + post._id).value = post.body;
                document.querySelector('#edit-form-' + post._id).setAttribute('data-id', post._id);
                // add event listener to edit form
                document.querySelector('#edit-form-' + post._id).addEventListener('submit', (e) => {
                    e.preventDefault();
                    const title = document.querySelector('#title-' + post._id).value;
                    const content = document.querySelector('#content-' + post._id).value;
                    const id = document.querySelector('#edit-form-' + post._id).getAttribute('data-id');
                    updatePost(id, title, content);
                });
            })
            postElement.appendChild(editForm);
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('bg-red-500');
            deleteButton.classList.add('text-white');
            deleteButton.classList.add('p-2');
            deleteButton.classList.add('rounded');
            deleteButton.innerHTML = 'Delete';
            deleteButton.addEventListener('click', () => {
                deletePost(post._id);
            });
            postElement.appendChild(editButton);
            postElement.appendChild(deleteButton);
        }
        // add comment button & text area to route PUT /api/blog/:id/comment
        const commentTextArea = document.createElement('textarea');
        commentTextArea.classList.add('w-full');
        commentTextArea.classList.add('p-2');
        commentTextArea.classList.add('rounded');
        commentTextArea.classList.add('shadow');
        commentTextArea.classList.add('mb-4');
        commentTextArea.classList.add('border');
        commentTextArea.classList.add('border-gray-300');
        commentTextArea.classList.add('resize-none');
        commentTextArea.setAttribute('id', 'comment-' + post._id);
        commentTextArea.setAttribute('placeholder', 'Comment');
        postElement.appendChild(commentTextArea);
       const commentButton = document.createElement('button');
        commentButton.classList.add('bg-green-500');
        commentButton.classList.add('text-white');
        commentButton.classList.add('p-2');
        commentButton.classList.add('rounded');
        commentButton.classList.add('mr-2');
        commentButton.innerHTML = 'Comment';
        commentButton.addEventListener('click', () => {
            commentPost(post._id);
        });
        postElement.appendChild(commentButton);
        // list comments for post
        const comments = post.comments;
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments');
        console.log(comments);
        for (let j = 0; j < comments.length; j++) {
            const comment = comments[j];
            const commentElement = document.createElement('div');
            commentElement.classList.add('bg-gray-200');
            commentElement.classList.add('p-2');
            commentElement.classList.add('rounded');
            commentElement.classList.add('shadow');
            commentElement.classList.add('mb-2');
            commentElement.innerHTML = `
                <p class="comment-content">${comment.text}</p>
                <p class="comment-author">By ${comment?.postedBy?.name || 'Anonymous'}</p>
            `;
            const commentContent = commentElement.querySelector('.comment-content');
            commentContent.classList.add('text-gray-600');
            commentContent.classList.add('text-lg');
            if (comment.postedBy._id === userId) {
                // add delete button to route DELETE /api/blog/comment/:commentId
                const deleteCommentButton = document.createElement('button');
                deleteCommentButton.classList.add('bg-red-500');
                deleteCommentButton.classList.add('text-white');
                deleteCommentButton.classList.add('p-2');
                deleteCommentButton.classList.add('rounded');
                deleteCommentButton.innerHTML = 'Delete';
                console.log(post._id, comment._id)
                deleteCommentButton.addEventListener('click', () => {
                    deleteComment(post._id, comment._id);
                });
                commentElement.appendChild(deleteCommentButton);
            }
            commentsContainer.appendChild(commentElement);
        }
        postElement.appendChild(commentsContainer);
        postsContainer.appendChild(postElement);
    }
}

function login() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    fetch(baseUrl + '/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Store the token in the browser
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('You are logged in');
            }
        })
        .catch(error => console.error(error));
}

function register() {
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    fetch(baseUrl + '/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log(data)

                // Store the token in the browser
                localStorage.setItem('token', data.token);
                alert('You are registered');
            }
        })
        .catch(error => console.error(error));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('user', '{"id":null,"name":null,"email":null,"role":null}');
}

async function fetchPosts() {
    console.log('fetching posts...')
    const posts = await fetch(baseUrl + '/api/blog/all')
        .then(response => response.json())
        .then(res => res)
        .catch(error => console.error(error));
const postsContainer = document.querySelector('.posts');
    // remove all posts
    postsContainer.innerHTML = '';
    console.log(posts)

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        const postElement = document.createElement('article');
        postElement.classList.add('bg-white');
        postElement.classList.add('p-4');
        postElement.classList.add('rounded');
        postElement.classList.add('shadow');
        postElement.classList.add('mb-4');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <h3 class="post-author">By ${post?.postedBy?.name || 'Anonymous'}</h3>
            <p class="post-content">${post.body}</p>
            <p class="post-date">${new Date(post.createdAt).toLocaleDateString()}</p>
        `;
        const postTitle = postElement.querySelector('.post-title');
        const postContent = postElement.querySelector('.post-content');
        postTitle.addEventListener('click', () => {
            postContent.classList.toggle('hidden');
        });
        postTitle.classList.add('text-2xl');
        postTitle.classList.add('font-bold');
        postTitle.classList.add('cursor-pointer');
        postContent.classList.add('hidden');
        postElement.classList.add('text-gray-600');
        postElement.classList.add('text-lg');

        // add comment button & text area to route PUT /api/blog/:id/comment
        const commentTextArea = document.createElement('textarea');
        commentTextArea.classList.add('w-full');
        commentTextArea.classList.add('p-2');
        commentTextArea.classList.add('rounded');
        commentTextArea.classList.add('shadow');
        commentTextArea.classList.add('mb-4');
        commentTextArea.classList.add('border');
        commentTextArea.classList.add('border-gray-300');
        commentTextArea.classList.add('resize-none');
        commentTextArea.setAttribute('id', 'comment');
        commentTextArea.setAttribute('placeholder', 'Comment');
        postElement.appendChild(commentTextArea);
       const commentButton = document.createElement('button');
        commentButton.classList.add('bg-green-500');
        commentButton.classList.add('text-white');
        commentButton.classList.add('p-2');
        commentButton.classList.add('rounded');
        commentButton.classList.add('mr-2');
        commentButton.innerHTML = 'Comment';
        commentButton.addEventListener('click', () => {
            commentPost(post._id);
        });
        postElement.appendChild(commentButton);
        // list comments for post
        const comments = post.comments;
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments');
        console.log(comments);
        for (let j = 0; j < comments.length; j++) {
            const comment = comments[j];
            const commentElement = document.createElement('div');
            commentElement.classList.add('bg-gray-200');
            commentElement.classList.add('p-2');
            commentElement.classList.add('rounded');
            commentElement.classList.add('shadow');
            commentElement.classList.add('mb-2');
            commentElement.innerHTML = `
                <p class="comment-content">${comment.text}</p>
                <p class="comment-author">By ${comment?.postedBy?.name || 'Anonymous'}</p>
            `;
            const commentContent = commentElement.querySelector('.comment-content');
            commentContent.classList.add('text-gray-600');
            commentContent.classList.add('text-lg');
            commentsContainer.appendChild(commentElement);
        }
        postElement.appendChild(commentsContainer);
        postsContainer.appendChild(postElement);
    }
}

function createPost() {
    const title = document.querySelector('#title').value;
    const body = document.querySelector('#content').value;
    fetch(baseUrl + '/api/blog/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            title,
            body
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error(error));
    alert('Post created successfully');
}

function updatePost(id, title, body) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/admin/post/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            title,
            body
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchFirstPosts();
    });

}

function commentPost(id) {
    // PUT /api/blog/:id/comment
    // PUT /api/blog/:id/comment
    const text = document.querySelector('#comment-' + id).value;
    fetch(baseUrl + '/api/blog/comment/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            text
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchFirstPosts();
        })
}

function deletePost(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/blog/' + id, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token
        },
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchFirstPosts();
    });
}


function deleteComment(post_id, commentId) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    console.log(commentId)
    fetch(baseUrl + '/api/blog/comment/' + post_id, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commentId
        })
    },
        ).then(response => response.json())
        .then(data => {
            fetchFirstPosts();
        });
}

async function fetchPostsAdmin() {
    console.log('fetching posts...')
    const posts = await fetch(baseUrl + '/api/admin/posts', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(res => res.posts)
        .catch(error => console.error(error));
    const postsContainer = document.querySelector('.posts');
    // remove all posts
    postsContainer.innerHTML = '';
    console.log(posts)

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        const postElement = document.createElement('article');
        postElement.classList.add('bg-white');
        postElement.classList.add('p-4');
        postElement.classList.add('rounded');
        postElement.classList.add('shadow');
        postElement.classList.add('mb-4');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2 class="post-title row">${post.title}<i class="ml-4">Hide Content</i></h2>
            <h3 class="post-author">By ${post?.postedBy?.name || 'Anonymous'}</h3>
            <p class="post-content">${post.body}</p>
            <p class="post-date">${new Date(post.createdAt).toLocaleDateString()}</p>
        `;
        const postTitle = postElement.querySelector('.post-title');
        const postContent = postElement.querySelector('.post-content');
        postTitle.addEventListener('click', () => {
            postContent.classList.toggle('hidden');
        });
        postTitle.classList.add('text-2xl');
        postTitle.classList.add('font-bold');
        postTitle.classList.add('cursor-pointer');
        postContent.classList.add('mt-4');
        postContent.classList.add('text-gray-600');
        postContent.classList.add('text-lg');
        postContent.classList.add('bg-gray-100');
        postElement.classList.add('text-gray-600');
        postElement.classList.add('text-lg');

        // create edit button and delete button
        const editButton = document.createElement('button');
        editButton.classList.add('bg-blue-500');
        editButton.classList.add('text-white');
        editButton.classList.add('p-2');
        editButton.classList.add('rounded');
        editButton.classList.add('mr-2');
        editButton.innerHTML = 'Edit';
        // add edit form
        const editForm = document.createElement('form');
        editForm.classList.add('hidden');
        editForm.classList.add('edit-form');
        editForm.classList.add('mb-4');
        editForm.classList.add('p-4');
        editForm.classList.add('bg-grey-100');
        editForm.classList.add('rounded');
        editForm.classList.add('shadow');
        editForm.setAttribute('id', 'edit-form-' + post._id);
        editForm.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Edit Post</h2>
            <div class="flex flex-col">
                <label for="title" class="mt-4">Title</label>
                <input type="text" name="title" id="title-${post._id}" class="border border-gray-400 p-2">
                <label for="content" class="mt-4">Content</label>
                <textarea name="content" id="content-${post._id}" cols="30" rows="10" class="border border-gray-400 p-2"></textarea>
                <button type="submit" class="bg-blue-500 text-white p-2 rounded mt-4">Update</button>
            </div>
        `;
        editButton.addEventListener('click', () => {
            // show edit form
            document.querySelector('#edit-form-' + post._id).classList.remove('hidden');
            document.querySelector('#title-' + post._id).value = post.title;
            document.querySelector('#content-' + post._id).value = post.body;
            document.querySelector('#edit-form-' + post._id).setAttribute('data-id', post._id);
            // add event listener to edit form
            document.querySelector('#edit-form-' + post._id).addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.querySelector('#title-' + post._id).value;
                const content = document.querySelector('#content-' + post._id).value;
                const id = document.querySelector('#edit-form-' + post._id).getAttribute('data-id');
                updatePostAdmin(id, title, content);
            });
        })
        postElement.appendChild(editForm);
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('bg-red-500');
        deleteButton.classList.add('text-white');
        deleteButton.classList.add('p-2');
        deleteButton.classList.add('rounded');
        deleteButton.innerHTML = 'Delete';
        deleteButton.addEventListener('click', () => {
            deletePostAdmin(post._id);
        });
        postElement.appendChild(editButton);
        postElement.appendChild(deleteButton);
        // add comment button & text area to route PUT /api/blog/:id/comment
        const commentTextArea = document.createElement('textarea');
        commentTextArea.classList.add('w-full');
        commentTextArea.classList.add('p-2');
        commentTextArea.classList.add('rounded');
        commentTextArea.classList.add('shadow');
        commentTextArea.classList.add('mb-4');
        commentTextArea.classList.add('border');
        commentTextArea.classList.add('border-gray-300');
        commentTextArea.classList.add('resize-none');
        commentTextArea.setAttribute('id', 'comment-' + post._id);
        commentTextArea.setAttribute('placeholder', 'Comment');
        postElement.appendChild(commentTextArea);
       const commentButton = document.createElement('button');
        commentButton.classList.add('bg-green-500');
        commentButton.classList.add('text-white');
        commentButton.classList.add('p-2');
        commentButton.classList.add('rounded');
        commentButton.classList.add('mr-2');
        commentButton.innerHTML = 'Comment';
        commentButton.addEventListener('click', () => {
            commentPostAdmin(post._id);
        });
        postElement.appendChild(commentButton);
        // list comments for post
        const comments = post.comments;
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments');
        console.log(comments);
        for (let j = 0; j < comments.length; j++) {
            const comment = comments[j];
            const commentElement = document.createElement('div');
            commentElement.classList.add('bg-gray-200');
            commentElement.classList.add('p-2');
            commentElement.classList.add('rounded');
            commentElement.classList.add('shadow');
            commentElement.classList.add('mb-2');
            commentElement.innerHTML = `
                <p class="comment-content">${comment.text}</p>
                <p class="comment-author">By ${comment?.postedBy?.name || 'Anonymous'}</p>
            `;
            const commentContent = commentElement.querySelector('.comment-content');
            commentContent.classList.add('text-gray-600');
            commentContent.classList.add('text-lg');
            // add delete button to route DELETE /api/blog/comment/:commentId
            const deleteCommentButton = document.createElement('button');
            deleteCommentButton.classList.add('bg-red-500');
            deleteCommentButton.classList.add('text-white');
            deleteCommentButton.classList.add('p-2');
            deleteCommentButton.classList.add('rounded');
            deleteCommentButton.innerHTML = 'Delete';
            console.log(post._id, comment._id)
            deleteCommentButton.addEventListener('click', () => {
                deleteCommentAdmin(post._id, comment._id);
            });
            commentElement.appendChild(deleteCommentButton);
            commentsContainer.appendChild(commentElement);
        }
        postElement.appendChild(commentsContainer);
        postsContainer.appendChild(postElement);
    }
}

function updatePostAdmin(id, title, body) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/admin/post/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            title,
            body
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchPostsAdmin();
    });
}

function commentPostAdmin(id) {
    // PUT /api/blog/:id/comment
    const text = document.querySelector('#comment-' + id).value;
    fetch(baseUrl + '/api/blog/comment/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            text
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchPostsAdmin();
        })
}

function deletePostAdmin(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/blog/' + id, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token
        },
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchPostsAdmin();
    });
}

function deleteCommentAdmin(post_id, commentId) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    console.log(commentId)
    fetch(baseUrl + '/api/blog/comment/' + post_id, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commentId
        })
    },
        ).then(response => response.json())
        .then(data => {
            fetchPostsAdmin();
        });
}


function createUserAdmin() {
    const name = document.querySelector('#uc-name').value;
    const email = document.querySelector('#uc-email').value;
    const password = document.querySelector('#uc-password').value;
    const isAdmin = document.querySelector('#uc-isAdmin').checked;
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/admin/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            name,
            email,
            password,
            isAdmin,
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchUsersAdmin();
    });
}

function fetchUsersAdmin() {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/admin/users', {
        headers: {
            Authorization: 'Bearer ' + token
        },
    }).then(response => response.json())
        .then(data => {
            const usersContainer = document.querySelector('.users');
            // clear users container
            usersContainer.innerHTML = '';

            const users = data.users;
            console.log(users)
            for (const user of users) {
                const userElement = document.createElement('article');
                userElement.classList.add('bg-white', 'shadow-md', 'rounded-md', 'p-4', 'm-4')
                userElement.classList.add('user');
                // add controls and view with tailwind
                userElement.innerHTML = `
                <h2 class="user-name text-2xl font-bold mb-2">${user.name}</h2>
                <p class="user-email text-gray-600 mb-2">${user.email}</p>
                <button class="user-delete btn btn-danger bg-red-500 text-white p-2 rounded-md mt-2" onclick="deleteUserAdmin('${user._id}')">Delete</button>
            `;
                if (user.isAdmin) {
                    userElement.classList.add('bg-green-100');
                    // add top notch Admin badge
                    const container = document.createElement('div');
                    container.classList.add('relative');
                    container.style.width = '100%';
                    const adminBadge = document.createElement('span');
                    adminBadge.classList.add('bg-green-500', 'text-white', 'p-2', 'rounded-md', 'top-0', 'mt-2', 'mr-2');
                    adminBadge.style.right = '0';
                    adminBadge.style.position = 'absolute';
                    adminBadge.style.top = '-50px';
                    adminBadge.innerText = 'Admin';
                    container.appendChild(adminBadge);
                    userElement.appendChild(container);
                }
                // add button to toggle update form
                const updateButton = document.createElement('button');
                updateButton.classList.add('user-update-button', 'btn', 'btn-primary', 'bg-blue-500', 'text-white', 'p-2', 'rounded-md', 'mt-2');
                updateButton.innerText = 'Update';
                updateButton.onclick = (e) => {
                    e.preventDefault();
                    const form = userElement.querySelector('#mu-form-' + user._id);
                    const nameInput = form.querySelector('#mu-name-' + user._id);
                    const emailInput = form.querySelector('#mu-email-' + user._id);
                    const isAdminInput = form.querySelector('#mu-isAdmin-' + user._id);
                    nameInput.value = user.name;
                    emailInput.value = user.email;
                    isAdminInput.checked = user.isAdmin;
                    form.classList.toggle('hidden');

                }
                userElement.appendChild(updateButton);
                // create a form to update user
                const form = document.createElement('div');
                form.classList.add('hidden', 'user-update-form', 'bg-white', 'shadow-md', 'rounded-md', 'p-4', 'm-4');
                form.id = `mu-form-${user._id}`;
                form.innerHTML = `
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="mu-name-${user._id}">
                        Name
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="mu-name-${user._id}" type="text" placeholder="Name">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="mu-email-${user._id}">
                        Email
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="mu-email-${user._id}" type="email" placeholder="Email">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="mu-isAdmin-${user._id}">
                        Is Admin
                    </label>
                    <input type="checkbox" name="admin" id="mu-isAdmin-${user._id}" class="border border-gray-400 p-2" />
                </div>
                `;
                const submitButton = document.createElement('button');
                submitButton.classList.add('btn', 'btn-primary', 'bg-blue-500', 'text-white', 'p-2', 'rounded-md', 'mt-2');
                submitButton.innerText = 'Update';
                submitButton.onclick = () => updateUserAdmin(user._id);
                form.appendChild(submitButton);
                userElement.appendChild(form);
                usersContainer.appendChild(userElement);
            }
        });
}

function updateUserAdmin(id) {
    const name = document.querySelector('#mu-name-' + id).value;
    const email = document.querySelector('#mu-email-' + id).value;
    const isAdmin = document.querySelector('#mu-isAdmin-' + id).checked;
    const token = localStorage.getItem('token');
    fetch(baseUrl + '/api/admin/user/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            name,
            email,
            isAdmin,
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchUsersAdmin();
    });
}

function deleteUserAdmin(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        return window.location.href = '/';
    }
    fetch(baseUrl + '/api/admin/user/' + id, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            fetchUsersAdmin();
    });
}

