const scroll = (id) => {
    const section = document.querySelector(id);
    section.scrollIntoView( { behavior: 'smooth', block: 'start' } );
  };

  export default scroll;