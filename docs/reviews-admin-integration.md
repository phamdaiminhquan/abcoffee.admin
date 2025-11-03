# Hướng dẫn tích hợp module **Review** (Admin)

Tài liệu này giúp team FE triển khai giao diện quản trị cho hệ thống review khách hàng. Các API mô tả dưới đây thuộc phạm vi `/api/admin/reviews` và **chỉ dành cho tài khoản có quyền ADMIN**.

## 1. Yêu cầu chung
- **Header bắt buộc**: `Authorization: Bearer <JWT>`.
- **Phân quyền**: Chỉ user có `role = ADMIN` được truy cập.
- **Định dạng dữ liệu**: JSON UTF-8, tuân thủ REST.
- **Soft delete**: Xóa review sẽ set `deletedAt` khác null, dữ liệu vẫn tồn tại để truy xuất khi cần.

## 2. Kiểu dữ liệu dùng chung
```ts
interface ReviewResponseDto {
  id: number;
  comment: string;
  rating: number; // chỉ chấp nhận 0.5, 1.0, 1.5, ..., 5.0
  images: string[]; // danh sách URL, có thể rỗng
  userId: number | null; // review do user đăng ký
  customerId: number | null; // review do khách vãng lai
  authorType: 'user' | 'customer' | null;
  authorName: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginatedReviewResponseDto {
  data: ReviewResponseDto[];
  page: number;
  limit: number;
  total: number;
}
```

### Quy tắc rating
- Giá trị hợp lệ: `0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0`.
- FE nên dùng dropdown hoặc slider giới hạn đúng bước 0.5.

### Quy tắc tác giả
- **Phải** cung cấp `userId` **hoặc** `customerId` (không để cả hai null).
- **Không** được gửi đồng thời cả `userId` và `customerId`.
- BE sẽ kiểm tra tồn tại của user/customer và đảm bảo chưa bị soft-delete.

### Hình ảnh (images)
- Là mảng các URL tuyệt đối hoặc tương đối (ví dụ: `/uploads/reviews/img1.jpg`).
- Có thể bỏ qua nếu review không có ảnh.

## 3. Danh sách API

### 3.1 Tạo review
```
POST /api/admin/reviews
Body (CreateReviewDto)
```
```json
{
  "userId": 12,
  "comment": "Đồ uống rất ngon, nhân viên thân thiện.",
  "rating": 4.5,
  "images": [
    "https://cdn.example.com/reviews/coffee-1.jpg"
  ]
}
```
- Nếu review thay mặt khách vãng lai: bỏ `userId`, gửi `customerId`.
- **Response 201**: `ReviewResponseDto`.
- **Lỗi 400**: vi phạm ràng buộc (rating sai, thiếu comment >= 10 ký tự, gửi cả userId & customerId, hình ảnh không hợp lệ...).

### 3.2 Danh sách review (có phân trang, lọc)
```
GET /api/admin/reviews
```
| Query param      | Kiểu     | Mô tả                                                                                       |
|------------------|----------|---------------------------------------------------------------------------------------------|
| `page`           | number   | Trang bắt đầu từ 1 (mặc định 1)                                                            |
| `limit`          | number   | Số item mỗi trang (1-100, mặc định 20)                                                     |
| `search`         | string   | Tìm theo comment, tên user hoặc tên customer (LIKE, không phân biệt hoa thường)           |
| `rating`         | number   | Lọc chính xác theo rating                                                                  |
| `minRating`      | number   | Lọc từ giá trị rating tối thiểu                                                            |
| `maxRating`      | number   | Lọc đến giá trị rating tối đa                                                              |
| `userId`         | number   | Lọc review của user cụ thể                                                                 |
| `customerId`     | number   | Lọc review của khách vãng lai cụ thể                                                       |
| `sort`           | string   | Chuỗi sắp xếp, ví dụ: `createdAt:desc,rating:desc`. Trường cho phép: `createdAt`, `updatedAt`, `rating` |
| `includeDeleted` | boolean  | `true` để hiển thị cả review đã soft delete (mặc định `false`)                            |

- **Response 200**: `PaginatedReviewResponseDto`.
- BE mặc định sắp xếp `createdAt DESC` nếu không truyền `sort`.

### 3.3 Xem chi tiết review
```
GET /api/admin/reviews/:id
```
| Query param      | Kiểu    | Mô tả                                        |
|------------------|---------|----------------------------------------------|
| `includeDeleted` | boolean | Cho phép lấy review dù đã bị soft delete     |

- **Response 200**: `ReviewResponseDto`.
- **Response 404**: review không tồn tại hoặc đã bị xóa (khi `includeDeleted=false`).

### 3.4 Cập nhật review
```
PATCH /api/admin/reviews/:id
Body (UpdateReviewDto)
```
```json
{
  "comment": "Cập nhật nội dung review sau khi phản hồi khách hàng.",
  "rating": 5,
  "images": []
}
```
- Có thể đổi tác giả bằng cách gửi `userId` **hoặc** `customerId` mới (BE kiểm tra ràng buộc như tạo mới).
- **Response 200**: `ReviewResponseDto` sau cập nhật.
- **Response 404**: review không tồn tại hoặc đã bị soft delete.

### 3.5 Xóa mềm review
```
DELETE /api/admin/reviews/:id
```
- **Response 204**: thành công, không có body.
- **Response 404**: review không tồn tại hoặc đã bị xóa trước đó.
- FE nên cập nhật UI lập tức (ẩn review hoặc đánh dấu trạng thái đã xóa). Nếu cần lấy lại, dùng `includeDeleted=true` ở API GET.

## 4. Workflow gợi ý trên FE

1. **Danh sách**
   - Gọi `GET /api/admin/reviews` với `page`, `limit`.
   - Hiển thị `authorType` + `authorName` để gắn nhãn (User/Guest).
   - Cho phép lọc nhanh theo rating (dropdown 0.5-step).
   - Cột trạng thái: nếu `deletedAt !== null` => Review đã bị xóa mềm (chỉ hiển thị khi `includeDeleted=true`).

2. **Tạo mới / cập nhật**
   - Form gồm: chọn User hoặc Customer (autocomplete), nhập rating (chuẩn bước 0.5), comment (min 10 ký tự), danh sách ảnh (URL hoặc upload -> nhận URL).
   - Khi lưu, gọi POST/PATCH tương ứng.
   - Sau khi thành công, refetch danh sách.

3. **Xóa mềm**
   - Button "Xóa" => gọi DELETE.
   - Có thể thêm tuỳ chọn filter `includeDeleted=true` để admin kiểm tra lịch sử.

4. **Xử lý lỗi**
   - 400: Hiển thị thông báo chi tiết từ `message` của BE (đã mô tả rõ lý do).
   - 404: Review không tồn tại hoặc đã bị xóa => đóng modal, refetch danh sách.
   - 401/403: Token hết hạn hoặc không có quyền => chuyển về trang đăng nhập.

## 5. Tips cho team FE
- Tạo enum rating hợp lệ trên FE để tái sử dụng (ví dụ constant `ALLOWED_REVIEW_RATINGS`).
- Khi người dùng chọn tác giả, đảm bảo toggle giữa User/Customer chỉ cho phép gửi một loại ID.
- `images` nên luôn gửi mảng, nếu không có ảnh => gửi `[]` hoặc bỏ field.
- Sử dụng timezone chuẩn (ISO string) khi hiển thị `createdAt`, `updatedAt`.
- Với bảng danh sách, nên giữ `page`, `limit`, `filters` trên URL query để dễ chia sẻ link.

---
Mọi thắc mắc thêm hãy trao đổi trực tiếp với team backend để đảm bảo hành vi thống nhất trước khi go-live.
