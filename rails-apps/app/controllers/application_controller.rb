class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  def home 
  end
  private
  def is_user_admin
    # unless user_signed_in?
    #     # Do custom stuff, ultimately restricting access to the 
    #     # ...protected resource if it needs to be
    # end
    result = false
    if current_user.nil? 
      result = false
      authenticate_user!
    else
      result =  current_user.try(:admin?)
      if result
        authenticate_user!
      end
    end
  end
end
