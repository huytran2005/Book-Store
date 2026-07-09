'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, ArrowUpRight, Upload } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { storageService } from '@/lib/storage';
import { Book, Category } from '@/types';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';

export default function AdminBooksPage() {
  const { showToast } = useToast();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedBooks, fetchedCats] = await Promise.all([
          bookService.getAllBooks(),
          bookService.getAllCategories(),
        ]);
        setBooks(fetchedBooks);
        setCategories(fetchedCats);
      } catch (error) {
        console.error('Error fetching admin books page:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCategory(categories[0]?.slug || '');
    setPrice(0);
    setOldPrice(undefined);
    setQuantity(0);
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setPrice(book.price);
    setOldPrice(book.oldPrice);
    setQuantity(book.quantity);
    setDescription(book.description);
    setImageUrl(book.imageUrl);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await storageService.uploadBookImage(file);
      setImageUrl(url);
      showToast('Tải lên ảnh sách thành công!', 'success');
    } catch (error) {
      console.error('Image upload failed:', error);
      showToast('Có lỗi xảy ra khi tải ảnh lên.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !category || price <= 0 || quantity < 0) {
      showToast('Vui lòng điền đúng thông tin bắt buộc!', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingBook) {
        // Edit Mode
        await bookService.updateBook(editingBook.id, {
          title,
          author,
          category,
          price,
          oldPrice: oldPrice || undefined,
          quantity,
          description,
          imageUrl,
        });

        setBooks(prev =>
          prev.map(b =>
            b.id === editingBook.id
              ? { ...b, title, author, category, price, oldPrice, quantity, description, imageUrl }
              : b
          )
        );
        showToast(`Cập nhật "${title}" thành công!`, 'success');
      } else {
        // Add Mode
        const newBook = await bookService.createBook({
          title,
          author,
          category,
          price,
          oldPrice: oldPrice || undefined,
          quantity,
          description,
          imageUrl,
        });

        setBooks(prev => [newBook, ...prev]);
        showToast(`Thêm sách mới "${title}" thành công!`, 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi lưu sách. Vui lòng thử lại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn chắc chắn muốn xóa cuốn sách "${name}"?`)) return;

    try {
      await bookService.deleteBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
      showToast(`Đã xóa sách "${name}" thành công!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi xóa sách.', 'error');
    }
  };

  const filteredBooks = books.filter(
    b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-800">Quản lý kho sách</h1>
          <p className="text-xs text-slate-450">Thêm mới, chỉnh sửa thông tin sách, cập nhật số lượng tồn kho.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/10 text-sm focus:outline-none"
        >
          <Plus size={16} /> Thêm sách mới
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center w-full max-w-md">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm sách theo tên, tác giả..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
        />
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-550 tracking-wider">
              <th className="px-6 py-4">Bìa</th>
              <th className="px-6 py-4">Tiêu đề sách</th>
              <th className="px-6 py-4">Tác giả</th>
              <th className="px-6 py-4">Thể loại</th>
              <th className="px-6 py-4">Giá bán</th>
              <th className="px-6 py-4 text-center">Tồn kho</th>
              <th className="px-6 py-4 text-center">Đã bán</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Không tìm thấy sách nào khớp với tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-3">
                    <img
                      src={book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150'}
                      alt={book.title}
                      className="w-9 aspect-[3/4] object-cover rounded border border-slate-100"
                    />
                  </td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{book.title}</td>
                  <td className="px-6 py-3 text-slate-600">{book.author}</td>
                  <td className="px-6 py-3 text-xs capitalize text-slate-500 font-medium">
                    {book.category.replace('-', ' ')}
                  </td>
                  <td className="px-6 py-3 font-bold text-amber-600">
                    {book.price.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-3 text-center font-semibold text-slate-700">{book.quantity}</td>
                  <td className="px-6 py-3 text-center text-slate-600">{book.sold}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Sửa sách"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa sách"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Cập nhật thông tin sách' : 'Thêm sách mới vào kho'}
        size="lg"
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="title-book">Tiêu đề sách *</label>
            <input
              id="title-book"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Nhà Giả Kim"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="author-book">Tác giả *</label>
            <input
              id="author-book"
              type="text"
              required
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="VD: Paulo Coelho"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Danh mục sách *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="qty-book">Số lượng nhập kho *</label>
            <input
              id="qty-book"
              type="number"
              required
              min={0}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="price-book">Giá bán (VNĐ) *</label>
            <input
              id="price-book"
              type="number"
              required
              min={1000}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              placeholder="79000"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="oldprice-book">Giá cũ (nếu giảm giá)</label>
            <input
              id="oldprice-book"
              type="number"
              min={1000}
              value={oldPrice || ''}
              onChange={e => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="99000"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="desc-book">Mô tả tóm tắt</label>
            <textarea
              id="desc-book"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Nhập giới thiệu tóm tắt nội dung sách..."
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Ảnh bìa sách *</label>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Dán link ảnh hoặc tải tệp lên ở bên..."
                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
              />
              
              {/* Image Upload Button */}
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-650 cursor-pointer flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold transition-colors shrink-0">
                <Upload size={14} />
                {uploadingImage ? 'Đang tải...' : 'Tải lên'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 aspect-[3/4] object-cover rounded border border-slate-200 mt-1"
              />
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
