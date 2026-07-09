'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { Category } from '@/types';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const fetchedCats = await bookService.getAllCategories();
        setCategories(fetchedCats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCats();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto generate slug from name
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Vui lòng nhập đầy đủ tên và đường dẫn slug!', 'error');
      return;
    }

    if (categories.some(cat => cat.slug === slug)) {
      showToast('Đường dẫn slug này đã tồn tại!', 'error');
      return;
    }

    setSaving(true);
    try {
      const newCat = await bookService.createCategory({ name, slug });
      setCategories(prev => [...prev, newCat]);
      setName('');
      setSlug('');
      showToast(`Đã thêm thể loại "${name}" thành công!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi thêm thể loại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Bạn chắc chắn muốn xóa thể loại "${catName}"?`)) return;

    try {
      await bookService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Đã xóa thể loại "${catName}" thành công!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi xóa thể loại.', 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Quản lý thể loại sách</h1>
        <p className="text-xs text-slate-450">Thêm mới hoặc xóa các danh mục/thể loại sách trong hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Add Category */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Tag size={16} className="text-amber-600" /> Thêm thể loại mới
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="cat-name-input">Tên thể loại *</label>
              <input
                id="cat-name-input"
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="VD: Khoa học viễn tưởng"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="cat-slug-input">Đường dẫn tĩnh (Slug) *</label>
              <input
                id="cat-slug-input"
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="VD: khoa-hoc-vien-tuong"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 mt-2"
            >
              {saving ? 'Đang thêm...' : 'Thêm danh mục'}
            </button>
          </form>
        </div>

        {/* Right Table: Category List */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-550 tracking-wider">
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Đường dẫn slug</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-slate-400">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-800">{cat.name}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa thể loại"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
