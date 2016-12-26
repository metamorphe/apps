module ApplicationHelper
  def markdown(text)
    options = {
      filter_html:     true,
      hard_wrap:       true, 
      link_attributes: { rel: 'nofollow', target: "_blank" },
      space_after_headers: true, 
      fenced_code_blocks: true
    }

    extensions = {
      autolink:           true,
      superscript:        true,
      disable_indented_code_blocks: true
    }

    renderer = Redcarpet::Render::HTML.new(options)
    markdown = Redcarpet::Markdown.new(renderer, extensions)

    markdown.render(text).html_safe
  end
  def get_licenses
    [["cc", "Creative Commons - Attribution"],["cc-sa", "Creative Commons - Attribution - Share Alike"],["cc-nd", "Creative Commons - Attribution - No Derivatives"],["cc-nc", "Creative Commons - Attribution - Non-Commercial"],["cc-nc-sa", "Creative Commons - Attribution - Non-Commercial - Share Alike"],["cc-nc-nd", "Creative Commons - Attribution - Non-Commercial - No Derivatives"],["pd0", "Creative Commons - Public Domain Dedication"],["gpl", "GNU - GPL"],["lgpl", "GNU - LGPL"],["bsd", "BSD License"]].map!{|m| [m[1], m[0]]}
  end
  def to_license(abbrev)
    get_licenses.select{|l| l[1] == abbrev}[0][0]
  end
end