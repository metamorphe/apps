class JigController < ApplicationController
  def designer
  	render :layout => "full_screen"
  end
  def form
  	@files = get_primitives()
  	render :layout => "full_screen"
  end
  def interface
    @files = get_primitives()
  	render :layout => "full_screen"
  end



  # HELPER METHODS
  def get_primitives
      {path: "/primitives/", filenames: Dir.glob("public/primitives/*").collect!{|c| c.split('/')[2..-1].join('/')}}
  end
end
