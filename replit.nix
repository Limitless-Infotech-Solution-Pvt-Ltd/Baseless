{pkgs}: {
  deps = [
    pkgs.haskellPackages.optimusprime
    pkgs.ipscan
    pkgs.haskellPackages.phonetic-languages-phonetics-basics
  ];
}
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      # Add any libraries needed for your application here.
    ];
    LANG = "en_US.UTF-8";
  };
}
