class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  has_one :member
  after_create :create_member
  	
  def create_member
    Member.create!(:user_id => id, :name => "", :description => "")
  end
end
