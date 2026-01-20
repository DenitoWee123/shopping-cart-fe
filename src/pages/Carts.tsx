import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Plus, UserPlus, X, Settings, Copy, Check,
  User, ChevronRight, Loader2, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserCarts, useCreateBasket, useJoinCart } from '../api/hooks';
import type { ShoppingBasketEntity } from '../types/api.types';

export default function Carts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: carts = [], isLoading, error, refetch } = useUserCarts();
  const createBasketMutation = useCreateBasket();
  const joinCartMutation = useJoinCart();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState<ShoppingBasketEntity | null>(null);
  const [newCartName, setNewCartName] = useState('');
  const [shareCodeToJoin, setShareCodeToJoin] = useState('');
  const [copied, setCopied] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const handleCartClick = (cartId: string) => {
    navigate(`/carts/${cartId}`);
  };

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return;

    try {
      await createBasketMutation.mutateAsync(newCartName.trim());
      setShowCreateModal(false);
      setNewCartName('');
      refetch();
    } catch (err) {
      console.error('Failed to create cart:', err);
    }
  };

  const handleJoinCart = async () => {
    if (!shareCodeToJoin.trim()) return;

    try {
      await joinCartMutation.mutateAsync(shareCodeToJoin.trim());
      setShowJoinModal(false);
      setShareCodeToJoin('');
      refetch();
    } catch (err) {
      console.error('Failed to join cart:', err);
    }
  };

  const handleOpenSettings = (cart: ShoppingBasketEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCart(cart);
    setShowSettingsModal(true);
  };

  const copyShareCode = () => {
    if (selectedCart?.shareCode) {
      navigator.clipboard.writeText(selectedCart.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMemberInitial = (username: string) => {
    return username?.charAt(0)?.toUpperCase() || 'U';
  };

  const isCurrentUser = (username: string) => {
    return username === user?.username;
  };

  if (isLoading) {
    return (
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{t('errors.generic')}</p>
            <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('carts.createCart')}
            </button>
            <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {t('carts.joinCart')}
            </button>
          </div>

          {/* Carts Grid */}
          {carts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('carts.noCarts')}</h3>
                <p className="text-gray-500 mb-6">{t('carts.noCartsDesc')}</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {carts.map((cart) => {
                  // Members are usernames from the backend
                  const members = cart.members || [];
                  const displayMembers = members.slice(0, 3);
                  const extraMembersCount = members.length > 3 ? members.length - 3 : 0;

                  return (
                      <button
                          key={cart.id}
                          onClick={() => handleCartClick(cart.id)}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all p-6 text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary-100 rounded-xl flex-shrink-0">
                            <ShoppingCart className="h-8 w-8 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{cart.name}</h3>
                            <p className="text-sm text-gray-500">
                              {members.length} {members.length === 1 ? t('carts.member') : t('carts.members')}
                              {cart.isShared && <span className="mx-1">•</span>}
                              {cart.isShared && <Users className="h-3 w-3 inline" />}
                            </p>

                            {/* Member avatars - using index as key since usernames might be duplicated */}
                            <div className="flex items-center gap-1 mt-2">
                              {displayMembers.map((username, idx) => (
                                  <div
                                      key={`${cart.id}-member-${idx}`}
                                      className="relative"
                                      onMouseEnter={() => setHoveredMember(`${cart.id}-${idx}`)}
                                      onMouseLeave={() => setHoveredMember(null)}
                                  >
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white bg-primary-100 text-primary-700"
                                        style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                                    >
                                      {getMemberInitial(username)}
                                    </div>
                                    {/* Tooltip */}
                                    {hoveredMember === `${cart.id}-${idx}` && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                                          {isCurrentUser(username) ? t('common.you') : username}
                                        </div>
                                    )}
                                  </div>
                              ))}
                              {extraMembersCount > 0 && (
                                  <div
                                      className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white"
                                      style={{ marginLeft: '-8px' }}
                                  >
                                    +{extraMembersCount}
                                  </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-2">
                              {t('carts.createdOn')} {formatDate(cart.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                                onClick={(e) => handleOpenSettings(cart, e)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={t('carts.settings')}
                            >
                              <Settings className="h-5 w-5" />
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </button>
                  );
                })}
              </div>
          )}
        </div>

        {/* Create Cart Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />

              <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <button
                    onClick={() => setShowCreateModal(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('carts.createCart')}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('carts.cartName')}
                  </label>
                  <input
                      type="text"
                      value={newCartName}
                      onChange={(e) => setNewCartName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('carts.cartNamePlaceholder')}
                      autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                      onClick={handleCreateCart}
                      disabled={!newCartName.trim() || createBasketMutation.isPending}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:bg-primary-300 transition-colors"
                  >
                    {createBasketMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                        t('common.create')
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Join Cart Modal */}
        {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowJoinModal(false)} />

              <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <button
                    onClick={() => setShowJoinModal(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('carts.joinCart')}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('carts.shareCode')}
                  </label>
                  <input
                      type="text"
                      value={shareCodeToJoin}
                      onChange={(e) => setShareCodeToJoin(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('carts.shareCodePlaceholder')}
                      autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('carts.cartIdHint')}</p>
                </div>

                <div className="flex gap-3">
                  <button
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                      onClick={handleJoinCart}
                      disabled={!shareCodeToJoin.trim() || joinCartMutation.isPending}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:bg-primary-300 transition-colors"
                  >
                    {joinCartMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                        t('carts.join')
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Cart Settings Modal */}
        {showSettingsModal && selectedCart && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettingsModal(false)} />

              <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 rounded-t-xl">
                  <button
                      onClick={() => setShowSettingsModal(false)}
                      className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Settings className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('carts.cartSettings')}</h3>
                      <p className="text-sm text-gray-500">{selectedCart.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Share Code */}
                  {selectedCart.shareCode && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          {t('carts.shareCode')}
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 truncate">
                            {selectedCart.shareCode}
                          </code>
                          <button
                              onClick={copyShareCode}
                              className="flex-shrink-0 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                              title={t('common.copy')}
                          >
                            {copied ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <Copy className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t('carts.shareIdHint')}</p>
                      </div>
                  )}

                  {/* Members List - members are usernames */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {t('carts.members')} ({selectedCart.members?.length || 0})
                    </label>
                    <div className="space-y-2">
                      {(selectedCart.members || []).map((username, idx) => {
                        const isSelf = isCurrentUser(username);

                        return (
                            <div
                                key={`settings-member-${idx}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
                                  <User className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {isSelf ? t('common.you') : username}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {t('carts.memberRole')}
                                  </p>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                        className="w-full px-4 py-2 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      {t('carts.leaveCart')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
