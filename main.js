//HTTP REQUEST GETALL GETONE PUT POST DELETE
const URL_REQUEST = 'http://localhost:3000/posts'
const URL_COMMENTS = 'http://localhost:3000/comments'

async function GetData() {
    try {
        let res = await fetch(URL_REQUEST);
        let posts = await res.json();
        
        let body_of_table = document.getElementById('table-body')
        body_of_table.innerHTML = "";
        
        for (const post of posts) {
            const textStyle = post.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
            const deleteButton = post.isDeleted ? '' : `<input type='submit' onclick='Delete(${post.id})' value='Delete'/>`;    
            body_of_table.innerHTML +=
                `<tr ${textStyle}>
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.views}</td>
                    <td>${deleteButton}</td>
                </tr>`;
         
        }
        GetComments();
    } catch (error) {
        console.log(error);
    }
}
// nếu id không tồn tai -> tạo mới
//id tồn tại thì sử dụng put 
async function Save() {
    // lấy dữ liệu từ form
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    //kiểm tra id đã tồn tại chưa
    let res;
    if (id !== "") {//ton tai roi - PUT
        res = await fetch(URL_REQUEST + '/' + id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views,
                    isDeleted: false
                })
            }
        );
    } else {
        // Lấy hết posts về để lấy max ID
        let resAll = await fetch(URL_REQUEST);
        let allPosts = await resAll.json();

        //Tìm ID lớn nhất và chuyển id thành số để dễ so
        let maxId = 0;
        allPosts.forEach( post => {
            if (Number(post.id) > maxId) {
                maxId = Number(post.id);
            }
        });
        //Chuyển ID thành chuỗi
        let newId = (maxId + 1).toString();

        // Gửi lệnh Post để tạo mới
        res = await fetch(URL_REQUEST,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: newId,
                    title: title,
                    views: views,
                    isDeleted:false
                })
            }
        );

    }
    //Kiểm tra và đưa ra lỗi
    if (!res.ok) {
        console.log("bi loi");
    }
    GetData();
    return false;
}
async function Delete(id) {
    let res = await fetch(URL_REQUEST + '/' + id, {
        method: 'PATCH', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDeleted: true })
    });
    if (res.ok) {
        console.log("xoa thanh cong");
        GetData();
    }
}
async function GetComments() {
    let res = await fetch(URL_COMMENTS);
    let comments = await res.json();
    let cmtBody = document.getElementById('comment-table-body');
    
    // Xóa trắng dữ liệu cũ trước khi render mới
    cmtBody.innerHTML = "";

    comments.forEach(cmt => {
        // Đảm bảo mỗi giá trị nằm trong một thẻ <td>
        cmtBody.innerHTML += `
            <tr>
                <td>${cmt.id}</td>
                <td>${cmt.body}</td>
                <td>${cmt.postId}</td>
                <td>
                    <button onclick="DeleteComment('${cmt.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function SaveComment() {
    let id = document.getElementById("cmt_id_txt").value;
    let body = document.getElementById("cmt_body_txt").value;
    let postId = document.getElementById("cmt_postId_txt").value;

    let res;
    if (id !== "") {
        // PUT (Sửa) - Tương tự như Post
        res = await fetch(`${URL_COMMENTS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body, postId })
        });
    } else {
        // POST (Tạo mới)
        // Lưu ý: tui lược bớt đoạn tìm MaxID cho ngắn gọn, json-server tự tạo ID nếu ông truyền số
        res = await fetch(URL_COMMENTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body, postId })
        });
    }

    if (res.ok) {
        GetComments();
        // Clear form
        document.getElementById("cmt_body_txt").value = "";
        document.getElementById("cmt_postId_txt").value = "";
    }
}

async function DeleteComment(id) {
    // Xóa thật (Hard Delete) để ông thấy sự khác biệt với Post
    let res = await fetch(`${URL_COMMENTS}/${id}`, { method: 'DELETE' });
    if (res.ok) GetComments();
}

// Gọi hàm khởi tạo
GetData()
