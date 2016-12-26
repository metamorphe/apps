Rails.application.routes.draw do

  # LIGHT AS MATERIAL
  get "lightasmaterial/" => "apps#light_as_material"
  namespace :lightasmaterial do
    get 'index'
    get 'pipeline'
    get 'lens'
    get 'splitter'
    get 'optimal_lens'
    get 'theoretical_testbed'
    get 'index'
    get 'displays'
    get 'start_server'
    get 'dope'
    get 'refract'
    get 'designer', :as => "app"
    get 'system_control'
  end


  get 'apps/tactile_generator/:id' => "apps#tactile_generator", :as =>"tactile_generator"
  get 'apps/aesthetic_electronics', :as => "ellustrate"
  get 'apps/proxyprint', :as => "proxyprint"
  get 'apps/light_as_material', :as => "light_as_material"
  resources :members

  resources :designs do
    get 'interface' =>"circuit#interface"
    member do 
      resources :digital_models
      get 'download_count'
      post 'design_update'
    end
  end

  namespace :circuit do
    get 'designer', :as => "designer"
    get 'generator', :as => "generator"
    post 'upload'
    get 'form', :as => "form"
    get 'primitives'
  end
  
  get 'circuit/interface/:id' => "circuit#interface",  :as => "circuit_interface"
  
  # devise_for :users, controllers: {:registrations => 'users/registrations'}
  devise_for :users
  # , controllers: { sessions: 'users/sessions'}



  resources :user, :only => ["show"]


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  # You can have the root of your site routed with "root"
  root 'application#home', :as => "app_home"
  
  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
