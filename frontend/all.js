async function fetchPosts() {
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
            if (comment?.postedBy?._id === user?.id) {
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

fetchPosts();
